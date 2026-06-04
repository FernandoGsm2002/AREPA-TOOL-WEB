import { createClient } from '@supabase/supabase-js';

async function validateTurnstile(token) {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: token
        })
    });
    const data = await res.json();
    return data.success === true;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://arepatool.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, turnstileToken } = req.body || {};

    if (!email || !turnstileToken) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const turnstileOk = await validateTurnstile(turnstileToken);
    if (!turnstileOk) {
        return res.status(400).json({ error: 'Verificación de seguridad inválida' });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Llamar recover sin revelar si el email existe o no
    await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
        redirectTo: 'https://www.arepatool.com/reset-password.html'
    });

    // Siempre responder igual para no revelar si el email está registrado
    return res.status(200).json({ success: true });
}
