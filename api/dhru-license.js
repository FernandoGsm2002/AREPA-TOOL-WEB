/**
 * API PARA DHRU FUSION - ACTIVACIÓN DE LICENCIAS
 * ===============================================
 * 
 * Tipo: SERVER SERVICE (Other Script 84)
 * Campo: Mail (correo del cliente)
 * 
 * Acciones soportadas:
 * - accountinfo: Verificar conexión (DHRU lo usa al sincronizar)
 * - placeorder: Activar licencia
 * - status: Verificar estado de orden
 * 
 * URL: https://arepa-tool-web.vercel.app/api/dhru-license
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Permitir GET para pruebas simples
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'OK',
      message: 'ArepaTool License API is running',
      version: '1.0.0'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'ERROR', message: 'Method not allowed' });
  }

  console.log('[DHRU-LICENSE] ===== Nueva petición =====');

  try {
    // Parsear body
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = Object.fromEntries(new URLSearchParams(body));
      } catch {
        body = {};
      }
    }

    console.log('[DHRU-LICENSE] Body:', JSON.stringify(body));

    const { key, action, service, orderid, mail, Mail, email, EMAIL, imei, IMEI, username } = body;

    // Validar API Key
    const API_SECRET = process.env.DHRU_API_SECRET;
    if (API_SECRET && key !== API_SECRET) {
      console.log('[DHRU-LICENSE] ❌ API Key inválida');
      return res.status(200).json({ 
        status: 'error',
        error: 'Invalid API Key'
      });
    }

    // ==================================================
    // ACCIÓN: accountinfo (verificación de conexión)
    // DHRU llama esto al sincronizar
    // ==================================================
    if (action === 'accountinfo' || action === 'getbalance' || action === 'balance') {
      console.log('[DHRU-LICENSE] ✅ accountinfo/getbalance - Conexión verificada');
      return res.status(200).json({
        status: 'success',
        balance: '999999.00',
        currency: 'USD',
        username: username || 'arepatool',
        message: 'API Connected Successfully'
      });
    }

    // ==================================================
    // ACCIÓN: getservices (lista de servicios)
    // ==================================================
    if (action === 'getservices' || action === 'services') {
      console.log('[DHRU-LICENSE] ✅ getservices');
      return res.status(200).json({
        status: 'success',
        services: [
          { id: '1', name: 'ArepaTool License 1 Year', price: '50.00' },
          { id: '2', name: 'ArepaTool License 6 Months', price: '30.00' },
          { id: '3', name: 'ArepaTool License 1 Month', price: '10.00' }
        ]
      });
    }

    // ==================================================
    // ACCIÓN: placeorder (activar licencia)
    // ==================================================
    if (action === 'placeorder' || action === 'order' || !action) {
      const clientEmail = (mail || Mail || email || EMAIL || imei || IMEI || '').trim().toLowerCase();
      const dhruOrderId = orderid || `ORDER_${Date.now()}`;

      console.log('[DHRU-LICENSE] placeorder - Email:', clientEmail);

      if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
        return res.status(200).json({ 
          status: 'error',
          error: 'Invalid or missing email'
        });
      }

      // Importar Supabase dinámicamente
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lumhpjfndlqhexnjmvtu.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Buscar usuario
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', clientEmail)
        .maybeSingle();

      if (error) {
        console.error('[DHRU-LICENSE] DB Error:', error);
        return res.status(200).json({ 
          status: 'error',
          error: 'Database error'
        });
      }

      // NO EXISTE
      if (!user) {
        console.log('[DHRU-LICENSE] ❌ Usuario NO encontrado');
        return res.status(200).json({
          status: 'error',
          error: `Correo no encontrado. Registrate primero en: https://arepa-tool-web.vercel.app`
        });
      }

      // EXISTE - Activar
      console.log('[DHRU-LICENSE] ✅ Usuario encontrado:', user.username);

      const now = new Date().toISOString();
      const days = service?.toLowerCase().includes('1month') ? 30 : 
                   service?.toLowerCase().includes('6month') ? 180 : 365;
      
      let expDate = new Date();
      if (user.subscription_end && new Date(user.subscription_end) > expDate) {
        expDate = new Date(user.subscription_end);
      }
      expDate.setDate(expDate.getDate() + days);

      await supabase.from('users').update({
        status: 'active',
        activated_at: user.status !== 'active' ? now : user.activated_at,
        subscription_end: expDate.toISOString(),
        dhru_order_id: dhruOrderId
      }).eq('id', user.id);

      const expiresStr = expDate.toLocaleDateString('es-ES');
      const msg = user.status === 'active' 
        ? `¡Licencia renovada! Usuario: ${user.username} - Válida hasta: ${expiresStr}`
        : `¡Licencia activada! Usuario: ${user.username} - Válida hasta: ${expiresStr}`;

      console.log('[DHRU-LICENSE] ✅', msg);

      return res.status(200).json({
        status: 'success',
        order_id: dhruOrderId,
        code: user.username,
        message: msg
      });
    }

    // ==================================================
    // ACCIÓN: status (verificar orden)
    // ==================================================
    if (action === 'status' || action === 'orderstatus') {
      return res.status(200).json({
        status: 'success',
        order_status: 'completed',
        message: 'Order processed'
      });
    }

    // Acción no reconocida
    console.log('[DHRU-LICENSE] ⚠️ Acción no reconocida:', action);
    return res.status(200).json({
      status: 'success',
      message: 'OK'
    });

  } catch (err) {
    console.error('[DHRU-LICENSE] Error:', err);
    return res.status(200).json({ 
      status: 'error',
      error: err.message 
    });
  }
}
