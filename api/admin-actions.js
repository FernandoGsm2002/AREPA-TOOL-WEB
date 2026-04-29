/**
 * Admin Actions API
 * All user status mutations go through here using service_role key,
 * which bypasses RLS policies and the status-escalation trigger.
 *
 * Required env vars: ADMIN_SECRET, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

async function validateAdminToken(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.slice(7);

    // Use anon client to verify the JWT
    const anonClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data?.user) return false;

    // Use service_role to check status='admin' (bypasses RLS)
    const adminClient = getAdminClient();
    const { data: profile } = await adminClient
        .from('users')
        .select('status')
        .eq('email', data.user.email)
        .maybeSingle();

    return profile?.status === 'admin';
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://arepatool.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const isAdmin = await validateAdminToken(req);
    if (!isAdmin) {
        return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { action } = req.query;
    const supabase = getAdminClient();

    // ── List all users ───────────────────────────────────────
    if (action === 'list-users') {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ users: data });
    }

    // ── Approve user ──────────────────────────────────────────
    if (action === 'approve-user') {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const now = new Date().toISOString();
        const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

        const { error } = await supabase
            .from('users')
            .update({ status: 'active', activated_at: now, subscription_end: oneYearLater })
            .eq('id', userId);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    // ── Suspend user ──────────────────────────────────────────
    if (action === 'suspend-user') {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const { error } = await supabase
            .from('users')
            .update({ status: 'suspended' })
            .eq('id', userId);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    // ── Update user (modal edit) ──────────────────────────────
    if (action === 'update-user') {
        const { userId, status, subscriptionEnd } = req.body;
        if (!userId || !status) return res.status(400).json({ error: 'Missing userId or status' });

        const updateData = { status };
        if (subscriptionEnd) {
            updateData.subscription_end = new Date(subscriptionEnd).toISOString();
        }

        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    // ── Delete user ───────────────────────────────────────────
    if (action === 'delete-user') {
        const { userId, email } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const { error: dbErr } = await supabase.from('users').delete().eq('id', userId);
        if (dbErr) return res.status(500).json({ error: dbErr.message });

        // Also remove from auth.users if email provided
        if (email) {
            const { data: authUser } = await supabase.auth.admin.listUsers();
            const target = authUser?.users?.find(u => u.email === email);
            if (target) {
                await supabase.auth.admin.deleteUser(target.id);
            }
        }

        return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
}
