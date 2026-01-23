import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lumhpjfndlqhexnjmvtu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bWhwamZuZGxxaGV4bmptdnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjY1NjcsImV4cCI6MjA3OTA0MjU2N30.oXVYUjnSpDDQphLZJzglGaDSQTjuGzYgD-LMC5FwDHw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    // CORS headers
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

        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const emailTrimmed = email.trim().toLowerCase();

        console.log('Reset request for email:', emailTrimmed);

        // Use Supabase Auth resetPasswordForEmail
        // This works with the ANON key as it's a public operation
        const { data, error } = await supabase.auth.resetPasswordForEmail(emailTrimmed, {
            redirectTo: 'https://www.arepatool.com/reset-password'
        });

        if (error) {
            console.error('Supabase Auth error:', error);
            // Don't reveal if user exists for security
            return res.status(200).json({
                message: 'Si el email existe en nuestro sistema, recibirás un link de recuperación'
            });
        }

        console.log('Reset email sent successfully');

        return res.status(200).json({
            message: 'Si el email existe en nuestro sistema, recibirás un link de recuperación'
        });

    } catch (error) {
        console.error('Request reset error:', error);
        return res.status(200).json({
            message: 'Si el email existe en nuestro sistema, recibirás un link de recuperación'
        });
    }
}
