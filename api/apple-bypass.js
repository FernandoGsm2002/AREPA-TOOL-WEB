import { createClient } from '@supabase/supabase-js';

// Validaciones básicas de formato
const SN_REGEX    = /^[A-Z0-9]{10,15}$/i;
const IMEI_REGEX  = /^[0-9]{14,15}$/;
const IOS_REGEX   = /^[0-9]{1,2}\.[0-9]{1,2}(\.[0-9]{1,2})?$/;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://www.arepatool.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

    // Rechazar bodies grandes
    const bodyStr = JSON.stringify(req.body || {});
    if (bodyStr.length > 4_096) return res.status(413).json({ success: false, error: 'Payload too large' });

    const {
        sessionId,
        serialNumber,
        imei,
        deviceName,
        productType,
        iosVersion,
        username,
        userEmail
    } = req.body || {};

    // Validar campos requeridos
    if (!sessionId || !serialNumber || !username || !userEmail) {
        return res.status(400).json({ success: false, error: 'Datos incompletos.' });
    }

    // Validar tipos y longitudes
    if (typeof sessionId     !== 'string' || sessionId.length     > 128 ||
        typeof serialNumber  !== 'string' || serialNumber.length  > 20  ||
        typeof username      !== 'string' || username.length      > 100 ||
        typeof userEmail     !== 'string' || userEmail.length     > 200) {
        return res.status(400).json({ success: false, error: 'Datos inválidos.' });
    }

    // Validar formato del serial number
    if (!SN_REGEX.test(serialNumber.trim())) {
        return res.status(400).json({ success: false, error: 'Formato de serial number inválido.' });
    }

    // Validar IMEI si se proporciona
    if (imei && imei !== 'N/A' && !IMEI_REGEX.test(imei.trim())) {
        return res.status(400).json({ success: false, error: 'Formato de IMEI inválido.' });
    }

    // Validar versión iOS si se proporciona
    if (iosVersion && iosVersion !== 'N/A' && !IOS_REGEX.test(iosVersion.trim())) {
        return res.status(400).json({ success: false, error: 'Formato de versión iOS inválido.' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const db = createClient(supabaseUrl, serviceKey);

    try {
        // 1. Verificar que la sesión es válida y activa
        const { data: session } = await db
            .from('sessions')
            .select('id, user_id, last_activity')
            .eq('id', sessionId)
            .maybeSingle();

        if (!session) {
            return res.status(401).json({ success: false, error: 'Sesión inválida. Vuelve a iniciar sesión.' });
        }

        // Sesión debe tener actividad reciente (6 horas)
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
        if (session.last_activity < sixHoursAgo) {
            return res.status(401).json({ success: false, error: 'Sesión expirada. Vuelve a iniciar sesión.' });
        }

        // 2. Verificar que el usuario tiene cuenta activa
        const { data: user } = await db
            .from('users')
            .select('id, status, subscription_end')
            .eq('id', session.user_id)
            .maybeSingle();

        if (!user || (user.status !== 'active' && user.status !== 'admin')) {
            return res.status(403).json({ success: false, error: 'Cuenta no autorizada para este servicio.' });
        }

        if (user.subscription_end && new Date(user.subscription_end) < new Date()) {
            return res.status(403).json({ success: false, error: 'Suscripción expirada.' });
        }

        // 3. Insertar o actualizar la solicitud (upsert por serial_number)
        const snClean = serialNumber.trim().toUpperCase();

        const { data: existing } = await db
            .from('apple_bypass_requests')
            .select('id, status')
            .eq('serial_number', snClean)
            .maybeSingle();

        if (existing) {
            // Si ya existe y está aprobada, no sobreescribir
            if (existing.status === 'approved') {
                return res.status(200).json({
                    success: true,
                    alreadyRegistered: true,
                    message: 'Este dispositivo ya fue registrado y aprobado.'
                });
            }

            // Actualizar datos si el registro es pending/rejected
            await db
                .from('apple_bypass_requests')
                .update({
                    device_name:  deviceName  || 'N/A',
                    product_type: productType || 'N/A',
                    ios_version:  iosVersion  || 'N/A',
                    imei:         imei        || 'N/A',
                    username,
                    user_email:   userEmail,
                    status:       'pending',
                    updated_at:   new Date().toISOString()
                })
                .eq('id', existing.id);

            return res.status(200).json({
                success: true,
                alreadyRegistered: false,
                message: 'Solicitud actualizada. En revisión por el equipo.'
            });
        }

        // 4. Crear nuevo registro
        const { error: insertError } = await db
            .from('apple_bypass_requests')
            .insert({
                serial_number: snClean,
                device_name:   deviceName  || 'N/A',
                product_type:  productType || 'N/A',
                ios_version:   iosVersion  || 'N/A',
                imei:          imei        || 'N/A',
                username,
                user_email:    userEmail,
                status:        'pending'
            });

        if (insertError) {
            console.error('Insert error:', insertError);
            return res.status(500).json({ success: false, error: 'Error al registrar la solicitud.' });
        }

        // 5. Audit log (fire and forget)
        db.from('audit_logs').insert({
            user_id:    session.user_id,
            action:     'apple_bypass_request',
            details:    `SN: ${snClean} | Device: ${deviceName || 'N/A'} | iOS: ${iosVersion || 'N/A'}`,
            created_at: new Date().toISOString()
        }).then(() => {}).catch(() => {});

        return res.status(200).json({
            success: true,
            alreadyRegistered: false,
            message: 'Solicitud registrada correctamente. En revisión por el equipo.'
        });

    } catch (err) {
        console.error('apple-bypass error:', err);
        return res.status(500).json({ success: false, error: `Error de servidor: ${err.message}` });
    }
}
