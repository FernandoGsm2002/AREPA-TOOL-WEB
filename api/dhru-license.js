/**
 * API PARA DHRU FUSION - ACTIVACIÓN DE LICENCIAS
 * ===============================================
 * 
 * Tipo: SERVER SERVICE (Other Script)
 * Campo: Mail (correo del cliente)
 * 
 * FLUJO:
 * 1. Cliente se registra en arepa-tool-web.vercel.app
 * 2. Cliente compra licencia en DHRU, ingresa su correo
 * 3. DHRU llama esta API
 * 4. API busca correo:
 *    - NO existe → Error: "Crea cuenta primero"
 *    - SÍ existe → Activa licencia
 * 
 * URL: https://tu-app.vercel.app/api/dhru-license
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lumhpjfndlqhexnjmvtu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const REGISTRATION_URL = 'https://arepa-tool-web.vercel.app';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'ERROR', message: 'Method not allowed' });
  }

  console.log('[DHRU-LICENSE] ===== Nueva petición =====');

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = Object.fromEntries(new URLSearchParams(body));
    }

    const { key, action, service, orderid, mail, Mail, email, EMAIL, imei, IMEI } = body;

    // Validar API Key (una sola key)
    const API_SECRET = process.env.DHRU_API_SECRET;
    if (API_SECRET && key !== API_SECRET) {
      console.log('[DHRU-LICENSE] ❌ API Key inválida');
      return res.status(401).json({ status: 'ERROR', message: 'Invalid API Key' });
    }

    // Obtener email del campo que venga
    const clientEmail = (mail || Mail || email || EMAIL || imei || IMEI || '').trim().toLowerCase();
    const dhruOrderId = orderid || `ORDER_${Date.now()}`;

    console.log('[DHRU-LICENSE] Email:', clientEmail);
    console.log('[DHRU-LICENSE] OrderID:', dhruOrderId);

    if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return res.status(400).json({ status: 'ERROR', message: 'Email inválido' });
    }

    // Buscar usuario
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', clientEmail)
      .maybeSingle();

    if (error) throw error;

    // NO EXISTE → Error
    if (!user) {
      console.log('[DHRU-LICENSE] ❌ Usuario NO encontrado');
      return res.status(200).json({
        status: 'ERROR',
        orderid: dhruOrderId,
        code: 'NOT_FOUND',
        message: `Correo no encontrado. Crea una cuenta primero en: ${REGISTRATION_URL}`
      });
    }

    // EXISTE → Activar
    console.log('[DHRU-LICENSE] ✅ Usuario encontrado:', user.username, '- Estado:', user.status);

    const now = new Date().toISOString();
    const days = service?.toLowerCase().includes('1month') ? 30 : 365;
    let expDate = new Date();
    if (user.subscription_end && new Date(user.subscription_end) > expDate) {
      expDate = new Date(user.subscription_end);
    }
    expDate.setDate(expDate.getDate() + days);

    await supabase.from('users').update({
      status: 'active',
      activated_at: user.status !== 'active' ? now : user.activated_at,
      subscription_end: expDate.toISOString(),
      dhru_order_id: dhruOrderId,
      updated_at: now
    }).eq('id', user.id);

    const expiresStr = expDate.toLocaleDateString('es-ES');
    const msg = user.status === 'active' 
      ? `¡Licencia renovada! Usuario: ${user.username} - Válida hasta: ${expiresStr}`
      : `¡Licencia activada! Usuario: ${user.username} - Válida hasta: ${expiresStr}`;

    console.log('[DHRU-LICENSE] ✅', msg);

    return res.status(200).json({
      status: 'SUCCESS',
      orderid: dhruOrderId,
      code: user.username,
      message: msg,
      details: { username: user.username, email: clientEmail, expires: expiresStr }
    });

  } catch (err) {
    console.error('[DHRU-LICENSE] Error:', err);
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
}
