import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://lumhpjfndlqhexnjmvtu.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // 1. Check if user exists in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('Error listing users:', authError);
            // Don't reveal if user exists for security
            return res.status(200).json({ 
                message: 'If this email exists, you will receive a reset link' 
            });
        }

        const authUser = authData.users.find(u => u.email === email);

        if (!authUser) {
            // Don't reveal if user doesn't exist for security
            return res.status(200).json({ 
                message: 'If this email exists, you will receive a reset link' 
            });
        }

        // 2. Generate password reset using Supabase Auth
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.VERCEL_URL || 'http://localhost:3000'}/reset-password.html`
        });

        if (error) {
            console.error('Error sending reset email:', error);
            throw error;
        }

        return res.status(200).json({
            message: 'Password reset email sent successfully'
        });

    } catch (error) {
        console.error('Request reset error:', error);
        return res.status(500).json({ 
            error: 'Failed to process request' 
        });
    }
}
