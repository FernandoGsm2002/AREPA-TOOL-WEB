// Relay: C# → Vercel (DNS siempre ok) → Supabase edge function (server-to-server)
// La edge function ya tiene NEXTDNS_KEY_1/2/3 como secrets y valida la sesión.
// Vercel solo actúa de puente para eliminar la dependencia DNS del cliente.

const EDGE_URL = 'https://lumhpjfndlqhexnjmvtu.supabase.co/functions/v1/nextdns-proxy';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://www.arepatool.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Reject oversized bodies
    const bodyStr = JSON.stringify(req.body || {});
    if (bodyStr.length > 32_768) return res.status(413).json({ error: 'Payload too large' });

    // Whitelist allowed actions — unknown actions never reach the edge function
    const ALLOWED_ACTIONS = ['create_profile', 'add_denylist', 'delete_profile', 'add_domain'];
    const { action } = req.body || {};
    if (!action || !ALLOWED_ACTIONS.includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
    }

    try {
        const response = await fetch(EDGE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
            },
            body: JSON.stringify(req.body),
            signal: AbortSignal.timeout(65_000)
        });

        const data = await response.json();
        return res.status(response.status).json(data);

    } catch (err) {
        console.error('nextdns-app relay error:', err);
        return res.status(502).json({ error: err.message });
    }
}
