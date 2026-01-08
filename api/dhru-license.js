/**
 * API PARA DHRU FUSION - ACTIVACIÓN DE LICENCIAS
 * ===============================================
 * 
 * Compatible con DHRU Fusion API Standards V6.1
 * Tipo: SERVER SERVICE (Other Script 84)
 * 
 * Servicio: ArepaToolV2 - Active User (12 month licence) - $14.99
 */

export default async function handler(req, res) {
  const apiversion = '6.1';
  
  // Headers DHRU
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

  console.log('[DHRU] Request received');

  try {
    // Parsear body
    let params = {};
    
    if (typeof req.body === 'object' && req.body !== null) {
      params = req.body;
    } else if (typeof req.body === 'string' && req.body.length > 0) {
      try {
        params = JSON.parse(req.body);
      } catch {
        try {
          params = Object.fromEntries(new URLSearchParams(req.body));
        } catch {}
      }
    }

    params = { ...req.query, ...params };
    
    const action = params.action || '';
    const key = params.key || params.apiaccesskey || '';

    console.log('[DHRU] Action:', action);

    // Validar API Key
    const API_SECRET = process.env.DHRU_API_SECRET;
    if (API_SECRET && key && key !== API_SECRET) {
      return res.status(200).json({
        ERROR: [{ MESSAGE: 'Authentication Failed' }],
        apiversion
      });
    }

    // ==================================================
    // ACCIÓN: accountinfo
    // ==================================================
    if (action === 'accountinfo') {
      console.log('[DHRU] ✅ accountinfo');
      
      // Formato exacto que DHRU espera
      const AccoutInfo = {
        credit: 999999.00,
        mail: 'ArepaToolAPI',
        currency: 'USD'
      };
      
      return res.status(200).json({
        SUCCESS: [{ 
          message: 'Your Accout Info', 
          AccoutInfo: AccoutInfo 
        }],
        apiversion
      });
    }

    // ==================================================
    // ACCIÓN: imeiservicelist (lista de servicios)
    // ==================================================
    if (action === 'imeiservicelist') {
      console.log('[DHRU] ✅ imeiservicelist');
      
      const ServiceList = {};
      const Group = 'ArepaToolV2 (Server Service)';
      
      ServiceList[Group] = {
        GROUPNAME: Group,
        GROUPTYPE: 'SERVER',
        SERVICES: {}
      };
      
      // Servicio único: ArepaToolV2 - Active User (12 month licence)
      const SERVICEID = 1;
      ServiceList[Group]['SERVICES'][SERVICEID] = {
        SERVICEID: SERVICEID,
        SERVICETYPE: 'SERVER',
        SERVICENAME: 'ArepaToolV2 - Active User (12 month licence)',
        CREDIT: 14.99,
        INFO: 'Activate user license for 12 months. User must register first at arepa-tool-web.vercel.app',
        TIME: 'Instant',
        QNT: 0,
        'Requires.Custom': [
          {
            type: 'serviceimei',
            fieldname: 'Mail',
            fieldtype: 'text',
            description: 'Customer email (must be registered)',
            fieldoptions: '',
            required: 1
          }
        ]
      };

      return res.status(200).json({
        SUCCESS: [{ 
          MESSAGE: 'IMEI Service List', 
          LIST: ServiceList 
        }],
        apiversion
      });
    }

    // ==================================================
    // ACCIÓN: placeimeiorder (activar licencia)
    // ==================================================
    if (action === 'placeimeiorder') {
      console.log('[DHRU] placeimeiorder');
      
      // Decodificar parameters
      let parameters = {};
      if (params.parameters) {
        try {
          parameters = JSON.parse(Buffer.from(params.parameters, 'base64').toString('utf8'));
        } catch {}
      }
      
      // Buscar email
      let clientEmail = '';
      
      // Desde custom fields
      if (parameters.customfield) {
        try {
          const cf = JSON.parse(Buffer.from(parameters.customfield, 'base64').toString('utf8'));
          clientEmail = cf.Mail || cf.mail || cf.MAIL || cf.email || cf.EMAIL || '';
        } catch {}
      }
      
      // Desde params directos
      if (!clientEmail) {
        clientEmail = params.mail || params.Mail || params.MAIL || 
                      params.email || params.EMAIL || 
                      params.imei || params.IMEI || 
                      parameters.IMEI || '';
      }
      
      clientEmail = String(clientEmail).trim().toLowerCase();
      console.log('[DHRU] Email:', clientEmail);

      if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
        return res.status(200).json({
          ERROR: [{ MESSAGE: 'Invalid or missing email address' }],
          apiversion
        });
      }

      // Conectar a Supabase
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
        console.log('[DHRU] DB Error:', error);
        return res.status(200).json({
          ERROR: [{ MESSAGE: 'Database error' }],
          apiversion
        });
      }

      // Usuario NO existe
      if (!user) {
        console.log('[DHRU] ❌ User not found:', clientEmail);
        return res.status(200).json({
          ERROR: [{ MESSAGE: 'Email not found. Customer must register first at: https://arepa-tool-web.vercel.app' }],
          apiversion
        });
      }

      // Usuario EXISTE - Activar licencia
      console.log('[DHRU] ✅ User found:', user.username);
      
      const now = new Date().toISOString();
      let expDate = new Date();
      
      // Si ya tiene suscripción activa, extender desde esa fecha
      if (user.subscription_end && new Date(user.subscription_end) > expDate) {
        expDate = new Date(user.subscription_end);
      }
      
      // Agregar 365 días (12 meses)
      expDate.setDate(expDate.getDate() + 365);
      
      const orderId = `AREPA_${Date.now()}`;

      // Actualizar usuario
      await supabase.from('users').update({
        status: 'active',
        activated_at: user.status !== 'active' ? now : user.activated_at,
        subscription_end: expDate.toISOString(),
        dhru_order_id: orderId
      }).eq('id', user.id);

      const expiresStr = expDate.toLocaleDateString('en-US');
      console.log('[DHRU] ✅ License activated for:', user.username, 'until:', expiresStr);

      return res.status(200).json({
        SUCCESS: [{ 
          MESSAGE: `License activated! User: ${user.username} - Valid until: ${expiresStr}`, 
          REFERENCEID: orderId 
        }],
        apiversion
      });
    }

    // ==================================================
    // ACCIÓN: getimeiorder
    // ==================================================
    if (action === 'getimeiorder') {
      const OrderID = params.orderid || (params.parameters ? JSON.parse(Buffer.from(params.parameters, 'base64').toString()).ID : '');
      console.log('[DHRU] getimeiorder:', OrderID);
      
      return res.status(200).json({
        SUCCESS: [{
          STATUS: 4, // 4 = Success/Available
          CODE: 'LICENSE_ACTIVATED'
        }],
        apiversion
      });
    }

    // Acción desconocida - retornar error
    console.log('[DHRU] Unknown action:', action);
    return res.status(200).json({
      ERROR: [{ MESSAGE: 'Invalid Action: ' + action }],
      apiversion
    });

  } catch (err) {
    console.error('[DHRU] Error:', err);
    return res.status(200).json({
      ERROR: [{ MESSAGE: 'Server error: ' + err.message }],
      apiversion: '6.1'
    });
  }
}
