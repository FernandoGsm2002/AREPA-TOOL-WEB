/**
 * API PARA ENVIAR BYPASS APROBADOS A DHRU
 * Endpoint que tu panel llamará cuando apruebes un bypass
 * 
 * URL: https://tu-vercel-app.vercel.app/api/dhru-bypass
 * Method: POST
 * Auth: Bearer token (Supabase session) requerido
 */

import { createClient } from '@supabase/supabase-js';

async function validateSession(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('status')
    .eq('email', data.user.email)
    .maybeSingle();

  if (!profile || (profile.status !== 'active' && profile.status !== 'admin')) return null;
  return data.user;
}

export default async function handler(req, res) {
  // CORS — solo tu dominio
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://arepatool.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar sesión autenticada
  const user = await validateSession(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Valid session required.' });
  }

  try {
    const { serial_number, username, email, approved_at } = req.body;

    // Validar datos
    if (!serial_number || !username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const DHRU_API_KEY = process.env.DHRU_API_KEY;
    const DHRU_API_URL = process.env.DHRU_API_URL;

    if (!DHRU_API_KEY || !DHRU_API_URL) {
      return res.status(500).json({ success: false, error: 'DHRU not configured' });
    }

    console.log('Sending bypass to Dhru:', { serial_number, username });

    // Enviar a Dhru Fusion
    const response = await fetch(DHRU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        key: DHRU_API_KEY,
        action: 'addorder',
        service: '201', // ID del servicio "iPhone Bypass" en Dhru
        imei: serial_number,
        email: email || 'noemail@provided.com',
        username: username,
        status: 'Completed',
        notes: `Approved via ArepaTool on ${approved_at || new Date().toISOString()}`
      })
    });

    const data = await response.json();

    console.log('Dhru Response:', data);

    if (data.status === 'SUCCESS' || data.orderid) {
      return res.status(200).json({ 
        success: true, 
        message: 'Bypass sent to Dhru successfully',
        dhru_order_id: data.orderid 
      });
    } else {
      throw new Error(data.message || 'Dhru API error');
    }

  } catch (error) {
    console.error('Error sending to Dhru:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
