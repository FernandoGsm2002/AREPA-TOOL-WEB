import { createClient } from '@supabase/supabase-js';

const NEXTDNS_API_KEYS = (process.env.NEXTDNS_API_KEYS || '').split(',').filter(Boolean);
let keyIndex = 0;

function getApiKey(server) {
    if (NEXTDNS_API_KEYS.length === 0) return null;
    if (server > 0 && server <= NEXTDNS_API_KEYS.length) return NEXTDNS_API_KEYS[server - 1];
    const key = NEXTDNS_API_KEYS[keyIndex % NEXTDNS_API_KEYS.length];
    keyIndex = (keyIndex + 1) % NEXTDNS_API_KEYS.length;
    return key;
}

function ndns(apiKey, path, method = 'GET', body = null) {
    const opts = { method, headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    return fetch(`https://api.nextdns.io${path}`, opts);
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { sessionId, userId, action, server = 0, data = {} } = req.body || {};

    if (!sessionId || !userId || !action) {
        return res.status(400).json({ error: 'Parámetros incompletos.' });
    }

    const db = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // Validate session — same 24h window as the edge function
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: found } = await db
            .from('sessions')
            .select('id')
            .eq('id', sessionId)
            .eq('user_id', userId)
            .gte('last_activity', cutoff)
            .limit(1);

        if (!found?.length) {
            return res.status(401).json({ error: 'Sesión inválida o expirada. Inicia sesión nuevamente.' });
        }

        // Refresh session activity (fire and forget)
        db.rpc('refresh_session', { p_session_id: sessionId }).then(() => {}).catch(() => {});

        const apiKey = getApiKey(server);
        if (!apiKey) return res.status(500).json({ error: 'NextDNS no configurado en el servidor.' });

        if (action === 'create_profile') {
            const r = await ndns(apiKey, '/profiles', 'POST', { name: data.name });
            if (!r.ok) throw new Error(`NextDNS: ${r.status}`);
            const profile = await r.json();
            const profileId = profile.data?.id ?? profile.id;
            return res.status(200).json({
                success: true,
                data: { profileId, dnsHostname: `${profileId}.dns.nextdns.io` }
            });
        }

        if (action === 'add_denylist') {
            const { profileId, domains = [] } = data;
            let added = 0;
            for (const domain of domains) {
                try {
                    await ndns(apiKey, `/profiles/${profileId}/denylist`, 'POST', { id: domain, active: true });
                    added++;
                } catch (_) {}
            }
            return res.status(200).json({ success: true, data: { added } });
        }

        if (action === 'delete_profile') {
            const profileId = data.hostname?.split('.')[0];
            if (!profileId) return res.status(400).json({ error: 'Hostname inválido.' });
            await ndns(apiKey, `/profiles/${profileId}`, 'DELETE');
            return res.status(200).json({ success: true, data: { success: true } });
        }

        if (action === 'add_domain') {
            const profileId = data.hostname?.split('.')[0];
            if (!profileId) return res.status(400).json({ error: 'Hostname inválido.' });
            await ndns(apiKey, `/profiles/${profileId}/denylist`, 'POST', { id: data.domain, active: true });
            return res.status(200).json({ success: true, data: { success: true } });
        }

        return res.status(400).json({ error: `Acción desconocida: ${action}` });

    } catch (err) {
        console.error('NextDNS proxy error:', err);
        return res.status(500).json({ error: err.message });
    }
}
