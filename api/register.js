import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

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

    const { username, email, password, turnstileToken } = req.body || {};

    if (!username || !email || !password || !turnstileToken) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    if (username.length < 3) return res.status(400).json({ error: 'Usuario muy corto' });
    if (password.length < 6) return res.status(400).json({ error: 'Contraseña muy corta' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Email inválido' });
    }

    const turnstileOk = await validateTurnstile(turnstileToken);
    if (!turnstileOk) {
        return res.status(400).json({ error: 'Verificación de seguridad inválida' });
    }

    const supabase = getAdminClient();

    // Verificar username disponible
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle();

    if (existingUser) {
        return res.status(409).json({ error: 'El usuario ya existe' });
    }

    // Verificar email disponible
    const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

    if (existingEmail) {
        return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true
    });

    if (authError) {
        const msg = authError.message?.includes('already registered')
            ? 'El email ya está en uso'
            : 'Error creando cuenta';
        return res.status(400).json({ error: msg });
    }

    // Crear perfil en tabla users
    const { error: profileError } = await supabase
        .from('users')
        .insert({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            status: 'pending',
            auth_id: authData.user.id,
            created_at: new Date().toISOString()
        });

    if (profileError) {
        // Revertir auth user si falla el perfil
        await supabase.auth.admin.deleteUser(authData.user.id);
        return res.status(500).json({ error: 'Error guardando perfil. Intenta de nuevo.' });
    }

    return res.status(201).json({ success: true });
}
