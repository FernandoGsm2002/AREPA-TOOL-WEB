/**
 * DHRU FUSION API v6.1
 * ArepaToolV2 – Server Service
 */

export default async function handler(req, res) {
  // ================= HEADERS =================
  res.setHeader('X-Powered-By', 'DHRU-FUSION');
  res.setHeader('dhru-fusion-api-version', '6.1');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ================= BODY PARSE =================
  let params = {};
  try {
    if (typeof req.body === 'object' && req.body !== null) {
      params = req.body;
    } else if (typeof req.body === 'string') {
      try {
        params = JSON.parse(req.body);
      } catch {
        params = Object.fromEntries(new URLSearchParams(req.body));
      }
    }
  } catch {}

  params = { ...req.query, ...params };

  const action = String(params.action || '').toLowerCase();
  const apiKey = params.key || params.apiaccesskey || '';

  // ================= API KEY =================
  const API_SECRET = process.env.DHRU_API_SECRET;
  if (API_SECRET && apiKey && apiKey !== API_SECRET) {
    return res.status(200).json({
      ERROR: [{ MESSAGE: 'Authentication Failed' }]
    });
  }

  // ======================================================
  // ACTION: accountinfo
  // ======================================================
  if (action === 'accountinfo') {
    return res.status(200).json({
      SUCCESS: true,
      message: 'Account Info',
      account_info: {
        username: 'ArepaTool',
        email: 'admin@arepa-tool.com',
        balance: '999999',
        currency: 'USD'
      }
    });
  }

  // ======================================================
  // ACTION: imeiservicelist
  // ======================================================
  if (action === 'imeiservicelist') {
    const GROUP = 'ArepaToolV2 (Server Service)';

    const ServiceList = {
      [GROUP]: {
        GROUPNAME: GROUP,
        GROUPTYPE: 'SERVER',
        SERVICES: {
          1: {
            SERVICEID: 1,
            SERVICETYPE: 'SERVER',
            SERVICENAME: 'ArepaToolV2 - Active User (12 month licence)',
            CREDIT: 14.99,
            INFO: 'Activate user license for 12 months. User must be registered.',
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
          }
        }
      }
    };

    return res.status(200).json({
      SUCCESS: [{
        MESSAGE: 'IMEI Service List',
        LIST: ServiceList
      }]
    });
  }

  // ======================================================
  // ACTION: placeimeiorder
  // ======================================================
  if (action === 'placeimeiorder') {
    let parameters = {};
    try {
      if (params.parameters) {
        parameters = JSON.parse(
          Buffer.from(params.parameters, 'base64').toString('utf8')
        );
      }
    } catch {}

    let email = '';

    try {
      if (parameters.customfield) {
        const cf = JSON.parse(
          Buffer.from(parameters.customfield, 'base64').toString('utf8')
        );
        email = cf.Mail || cf.mail || '';
      }
    } catch {}

    if (!email) {
      email =
        params.mail ||
        params.email ||
        params.imei ||
        parameters.IMEI ||
        '';
    }

    email = String(email).trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(200).json({
        ERROR: [{ MESSAGE: 'Invalid or missing email address' }]
      });
    }

    const { createClient } = await import('@supabase/supabase-js');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(200).json({
        ERROR: [{
          MESSAGE: 'Email not found. User must register first.'
        }]
      });
    }

    const now = new Date();
    let expiry = user.subscription_end
      ? new Date(user.subscription_end)
      : now;

    if (expiry < now) expiry = now;
    expiry.setDate(expiry.getDate() + 365);

    const orderId = `AREPA_${Date.now()}`;

    await supabase
      .from('users')
      .update({
        status: 'active',
        activated_at: user.activated_at || now.toISOString(),
        subscription_end: expiry.toISOString(),
        dhru_order_id: orderId
      })
      .eq('id', user.id);

    return res.status(200).json({
      SUCCESS: [{
        MESSAGE: `License activated successfully`,
        REFERENCEID: orderId
      }]
    });
  }

  // ======================================================
  // ACTION: getimeiorder
  // ======================================================
  if (action === 'getimeiorder') {
    return res.status(200).json({
      SUCCESS: [{
        STATUS: 4,
        CODE: 'LICENSE_ACTIVATED'
      }]
    });
  }

  // ======================================================
  // UNKNOWN ACTION
  // ======================================================
  return res.status(200).json({
    ERROR: [{ MESSAGE: 'Invalid Action' }]
  });
}
