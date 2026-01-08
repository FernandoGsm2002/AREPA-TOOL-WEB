/**
 * API PARA DHRU FUSION - ACTIVACIÓN DE LICENCIAS
 * ===============================================
 * 
 * Formato de respuesta compatible con DHRU Fusion API Standards V6.1
 * 
 * Tipo: SERVER SERVICE (Other Script 84)
 * Campo: Mail (correo del cliente)
 */

export default async function handler(req, res) {
  const apiversion = '6.1';
  
  // Headers que DHRU espera
  res.setHeader('X-Powered-By', 'DHRU-FUSION');
  res.setHeader('dhru-fusion-api-version', apiversion);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method === 'GET') {
    return res.status(200).json({
      SUCCESS: [{ message: 'ArepaTool License API is running' }],
      apiversion
    });
  }

  if (req.method !== 'POST') {
    return res.status(200).json({
      ERROR: [{ MESSAGE: 'Method not allowed' }],
      apiversion
    });
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

    // DHRU envía parámetros adicionales en 'parameters' como base64(JSON)
    let parameters = {};
    if (body.parameters) {
      try {
        parameters = JSON.parse(Buffer.from(body.parameters, 'base64').toString());
      } catch (e) {
        console.log('[DHRU-LICENSE] No se pudo parsear parameters');
      }
    }

    console.log('[DHRU-LICENSE] Body:', JSON.stringify(body));
    console.log('[DHRU-LICENSE] Parameters:', JSON.stringify(parameters));

    const { username, apiaccesskey, action } = body;
    const key = body.key || apiaccesskey;

    // Validar API Key
    const API_SECRET = process.env.DHRU_API_SECRET;
    if (API_SECRET && key !== API_SECRET) {
      console.log('[DHRU-LICENSE] ❌ Authentication Failed');
      return res.status(200).json({
        ERROR: [{ MESSAGE: 'Authentication Failed' }],
        apiversion
      });
    }

    console.log('[DHRU-LICENSE] Action:', action);

    // ==================================================
    // ACCIÓN: accountinfo
    // ==================================================
    if (action === 'accountinfo') {
      console.log('[DHRU-LICENSE] ✅ accountinfo');
      const AccoutInfo = {
        credit: 999999,
        mail: 'admin@arepatool.com',
        currency: 'USD'
      };
      return res.status(200).json({
        SUCCESS: [{ message: 'Your Accout Info', AccoutInfo }],
        apiversion
      });
    }

    // ==================================================
    // ACCIÓN: imeiservicelist (lista de servicios)
    // ==================================================
    if (action === 'imeiservicelist' || action === 'servicelist') {
      console.log('[DHRU-LICENSE] ✅ imeiservicelist');
      const Group = 'ArepaTool Licenses';
      const ServiceList = {};
      
      ServiceList[Group] = {
        GROUPNAME: Group,
        GROUPTYPE: 'SERVER',
        SERVICES: {
          1: {
            SERVICEID: 1,
            SERVICETYPE: 'SERVER',
            SERVICENAME: 'ArepaTool License 1 Year',
            CREDIT: 50,
            INFO: 'Licencia de 1 año para ArepaTool',
            TIME: 'Instant',
            QNT: 0
          },
          2: {
            SERVICEID: 2,
            SERVICETYPE: 'SERVER',
            SERVICENAME: 'ArepaTool License 6 Months',
            CREDIT: 30,
            INFO: 'Licencia de 6 meses para ArepaTool',
            TIME: 'Instant',
            QNT: 0
          }
        }
      };

      return res.status(200).json({
        SUCCESS: [{ MESSAGE: 'IMEI Service List', LIST: ServiceList }],
        apiversion
      });
    }

    // ==================================================
    // ACCIÓN: placeimeiorder (activar licencia)
    // ==================================================
    if (action === 'placeimeiorder' || action === 'placeorder') {
      // Obtener email del campo custom o del imei
      const ServiceId = parameters.ID || body.serviceid || body.service;
      const customField = parameters.customfield 
        ? JSON.parse(Buffer.from(parameters.customfield, 'base64').toString()) 
        : {};
      
      // El email puede venir de múltiples lugares
      const clientEmail = (
        customField.MAIL || customField.mail || customField.Mail ||
        customField.EMAIL || customField.email ||
        body.mail || body.Mail || body.email || body.EMAIL ||
        body.imei || body.IMEI || ''
      ).trim().toLowerCase();

      console.log('[DHRU-LICENSE] placeimeiorder');
      console.log('[DHRU-LICENSE] Email:', clientEmail);
      console.log('[DHRU-LICENSE] ServiceId:', ServiceId);

      if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
        return res.status(200).json({
          ERROR: [{ MESSAGE: 'Invalid or missing email' }],
          apiversion
        });
      }

      // Importar Supabase
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
          ERROR: [{ MESSAGE: 'Database error' }],
          apiversion
        });
      }

      // NO EXISTE
      if (!user) {
        console.log('[DHRU-LICENSE] ❌ Usuario NO encontrado');
        return res.status(200).json({
          ERROR: [{ MESSAGE: 'Correo no encontrado. Registrate primero en: https://arepa-tool-web.vercel.app' }],
          apiversion
        });
      }

      // EXISTE - Activar
      console.log('[DHRU-LICENSE] ✅ Usuario encontrado:', user.username);

      const now = new Date().toISOString();
      const days = ServiceId == 2 ? 180 : 365;
      
      let expDate = new Date();
      if (user.subscription_end && new Date(user.subscription_end) > expDate) {
        expDate = new Date(user.subscription_end);
      }
      expDate.setDate(expDate.getDate() + days);

      const orderId = `DHRU_${Date.now()}`;

      await supabase.from('users').update({
        status: 'active',
        activated_at: user.status !== 'active' ? now : user.activated_at,
        subscription_end: expDate.toISOString(),
        dhru_order_id: orderId
      }).eq('id', user.id);

      const expiresStr = expDate.toLocaleDateString('es-ES');
      const msg = user.status === 'active' 
        ? `Licencia renovada! Usuario: ${user.username} - Valida hasta: ${expiresStr}`
        : `Licencia activada! Usuario: ${user.username} - Valida hasta: ${expiresStr}`;

      console.log('[DHRU-LICENSE] ✅', msg);

      return res.status(200).json({
        SUCCESS: [{ MESSAGE: msg, REFERENCEID: orderId }],
        apiversion
      });
    }

    // ==================================================
    // ACCIÓN: getimeiorder (verificar orden)
    // ==================================================
    if (action === 'getimeiorder' || action === 'getorder') {
      const OrderID = parameters.ID || body.orderid;
      console.log('[DHRU-LICENSE] getimeiorder:', OrderID);
      
      return res.status(200).json({
        SUCCESS: [{
          STATUS: 4, // 4 = Available(Success)
          CODE: 'LICENSE_ACTIVATED'
        }],
        apiversion
      });
    }

    // Acción no reconocida
    console.log('[DHRU-LICENSE] ⚠️ Invalid Action:', action);
    return res.status(200).json({
      ERROR: [{ MESSAGE: 'Invalid Action' }],
      apiversion
    });

  } catch (err) {
    console.error('[DHRU-LICENSE] Error:', err);
    return res.status(200).json({
      ERROR: [{ MESSAGE: err.message }],
      apiversion: '6.1'
    });
  }
}
