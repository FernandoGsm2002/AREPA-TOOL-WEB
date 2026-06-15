import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
const WHATSAPP_GROUP_LINK = process.env.WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/IhgklDwwGBiH36zt0ntPBE?mode=gi_t';

// Use service role to query users table without RLS restrictions
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyTurnstile(token, ip) {
    if (!TURNSTILE_SECRET) {
        console.error('[Turnstile] TURNSTILE_SECRET_KEY no está configurada en las variables de entorno de Vercel.');
        return false;
    }

    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = await response.json();
    console.log('[Turnstile] siteverify response:', JSON.stringify(data));
    return data.success === true;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://www.arepatool.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { email, turnstileToken } = req.body;

        // --- Validate inputs ---
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'El correo electrónico es requerido.' });
        }
        if (!turnstileToken) {
            return res.status(400).json({ error: 'Verificación de seguridad requerida.' });
        }

        const emailTrimmed = email.trim().toLowerCase();

        // --- Verify Cloudflare Turnstile ---
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
        const turnstileValid = await verifyTurnstile(turnstileToken, ip);

        if (!turnstileValid) {
            return res.status(403).json({ error: 'Verificación de seguridad fallida. Intenta de nuevo.' });
        }

        // --- Check if email exists in users table ---
        const { data, error } = await supabase
            .from('users')
            .select('email')
            .eq('email', emailTrimmed)
            .maybeSingle();

        if (error) {
            console.error('Supabase query error:', error);
            return res.status(500).json({ error: 'Error interno. Intenta más tarde.' });
        }

        if (!data) {
            // Email not found — intentionally vague message
            return res.status(404).json({ error: 'Este correo no tiene acceso al grupo. ¿Ya tienes una licencia activa?' });
        }

        // --- Email found: return group link ---
        return res.status(200).json({ link: WHATSAPP_GROUP_LINK });

    } catch (err) {
        console.error('whatsapp-group error:', err);
        return res.status(500).json({ error: 'Error interno. Intenta más tarde.' });
    }
}
