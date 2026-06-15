import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

    // Reject oversized bodies (prevents payload stuffing)
    const bodyStr = JSON.stringify(req.body || {});
    if (bodyStr.length > 4_096) return res.status(413).json({ success: false, error: 'Payload too large', category: 'network' });

    const { username, password, machineId, machineName } = req.body || {};

    if (!username || !password || !machineId) {
        return res.status(400).json({ success: false, error: 'Datos incompletos.', category: 'network' });
    }

    // Basic format guards — prevents obviously malformed input reaching the DB
    if (typeof username !== 'string' || username.length > 100 ||
        typeof password !== 'string' || password.length > 256 ||
        typeof machineId !== 'string' || machineId.length > 128) {
        return res.status(400).json({ success: false, error: 'Datos inválidos.', category: 'network' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const db = createClient(supabaseUrl, serviceKey);

    try {
        // 0. Check if device is banned
        const { data: banned } = await db
            .from('banned_devices')
            .select('id')
            .eq('device_id', machineId)
            .maybeSingle();

        if (banned) {
            return res.status(200).json({
                success: false,
                error: 'Este dispositivo ha sido bloqueado.\nContacta al administrador.',
                category: 'license'
            });
        }

        // 1. Find user by username, fallback to email
        const usernameClean = username.toLowerCase().trim();
        let user = null;

        const { data: byUsername } = await db.rpc('get_user_by_username', { p_username: usernameClean });
        user = byUsername?.[0] ?? null;

        if (!user) {
            const { data: byEmail } = await db.rpc('get_user_by_email', { p_email: usernameClean });
            user = byEmail?.[0] ?? null;
        }

        if (!user) {
            return res.status(200).json({
                success: false,
                error: 'Usuario no encontrado.\nVerifica tu nombre de usuario.',
                category: 'credentials'
            });
        }

        // 2. Authenticate with Supabase Auth (server-side — no DNS dependency for client)
        const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { 'apikey': anonKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password })
        });

        if (!authRes.ok) {
            const s = authRes.status;
            if (s >= 500) return res.status(200).json({ success: false, error: 'Error del servidor. Intenta en unos momentos.', category: 'network' });
            if (s === 429) return res.status(200).json({ success: false, error: 'Demasiados intentos. Espera unos minutos.', category: 'network' });
            return res.status(200).json({ success: false, error: 'Contraseña incorrecta.', category: 'credentials' });
        }

        // 3. Check user status
        if (user.status === 'pending') {
            return res.status(200).json({ success: false, error: 'Cuenta pendiente de aprobación.\nContacta al administrador para activar tu licencia.', category: 'license' });
        }
        if (user.status === 'suspended') {
            return res.status(200).json({ success: false, error: 'Cuenta suspendida.\nContacta al administrador para más información.', category: 'license' });
        }
        if (user.status !== 'active' && user.status !== 'admin') {
            return res.status(200).json({ success: false, error: `Estado de cuenta inválido: ${user.status}`, category: 'license' });
        }

        // 4. Check subscription expiry
        if (user.subscription_end && new Date(user.subscription_end) < new Date()) {
            return res.status(200).json({ success: false, error: 'Suscripción expirada.\nRenueva tu licencia para continuar.', category: 'license' });
        }

        // 5. Check for active session on another device (6h window)
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
        const { data: sessions } = await db
            .from('sessions')
            .select('id, device_id, last_activity, machine_name')
            .eq('user_id', user.id);

        const activeOnOther = sessions?.find(s =>
            s.device_id !== machineId && s.last_activity > sixHoursAgo
        );

        if (activeOnOther) {
            const expiry    = new Date(new Date(activeOnOther.last_activity).getTime() + 6 * 60 * 60 * 1000);
            const remaining = expiry - Date.now();
            const h = Math.floor(remaining / 3600000);
            const m = Math.floor((remaining % 3600000) / 60000);
            const timeText = h > 0 ? `${h}h ${m}m` : `${m} min`;
            const pcName   = activeOnOther.machine_name || 'otra máquina';

            return res.status(200).json({
                success: false,
                error: `Licencia activa en otra PC\n  PC: ${pcName}\n  Disponible en: ${timeText}`,
                category: 'machine_block'
            });
        }

        // 6. Update machine validation
        await db.rpc('update_machine_validation', { p_user_id: user.id, p_machine_id: machineId });

        // 7. Upsert session — IP from client's real network (x-forwarded-for)
        const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
        const { data: sessionData } = await db.rpc('upsert_session', {
            p_user_id:     user.id,
            p_device_id:   machineId,
            p_ip_address:  clientIp,
            p_machine_name: machineName || 'unknown'
        });

        const session = sessionData?.[0];
        if (!session?.id) {
            return res.status(200).json({ success: false, error: 'No se pudo crear la sesión. Intenta de nuevo.', category: 'network' });
        }

        // 8. Audit log (fire and forget — does not block response)
        db.from('audit_logs').insert({
            user_id:    user.id,
            action:     'login',
            details:    `Login desde ${machineName || 'unknown'}`,
            created_at: new Date().toISOString()
        }).then(() => {}).catch(() => {});

        // 9. Return all user + session data the C# app needs
        return res.status(200).json({
            success:         true,
            sessionId:       session.id,
            userId:          user.id,
            username:        user.username,
            email:           user.email,
            status:          user.status,
            subscriptionEnd: user.subscription_end ?? null,
            currentMachineId: machineId,
            lastValidation:  user.last_validation ?? null,
            dhruOrderId:     user.dhru_order_id ?? null,
            message:         `¡Bienvenido, ${user.username}!`
        });

    } catch (err) {
        console.error('Login proxy error:', err);
        return res.status(200).json({ success: false, error: `Error de servidor: ${err.message}`, category: 'network' });
    }
}
