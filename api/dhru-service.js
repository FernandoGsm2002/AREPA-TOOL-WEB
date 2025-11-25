/**
 * API PARA DHRU FUSION
 * Endpoint que Dhru llamará cuando haya una nueva orden de licencia
 * 
 * URL: https://tu-vercel-app.vercel.app/api/dhru-service
 * Method: POST
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'ERROR',
      message: 'Method not allowed'
    });
  }

  try {
    // Parámetros que Dhru envía
    const {
      key,           // API Key para autenticación
      action,        // Acción: placeorder, status, getbalance
      service,       // ID del servicio en Dhru
      imei,          // IMEI/Serial (usamos para email)
      email,         // Email del cliente
      orderid        // ID de la orden en Dhru
    } = req.body;

    // Log para debugging
    console.log('Dhru Request:', { action, service, email, orderid });

    // Verificar API Key
    if (key !== process.env.DHRU_API_SECRET) {
      console.error('Invalid API Key');
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid API Key'
      });
    }

    // Manejar diferentes acciones
    switch (action) {
      case 'placeorder':
        return await handlePlaceOrder(req.body, res);
      
      case 'status':
        return await handleCheckStatus(req.body, res);
      
      case 'getbalance':
        return await handleGetBalance(res);
      
      default:
        return res.status(400).json({
          status: 'ERROR',
          message: `Invalid action: ${action}`
        });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
}

/**
 * CREAR NUEVA LICENCIA (USUARIO)
 */
async function handlePlaceOrder(data, res) {
  const { service, email, orderid } = data;

  try {
    // Generar credenciales únicas
    const username = generateUsername(email);
    const password = generatePassword();
    const subscription_end = calculateExpiration(service);

    console.log('Creating user:', { username, email, orderid });

    // Crear usuario en Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username: username,
        email: email,
        status: 'active',
        subscription_end: subscription_end,
        dhru_order_id: orderid,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('User created successfully:', user.id);

    // Respuesta en formato Dhru Fusion
    return res.status(200).json({
      status: 'SUCCESS',
      orderid: orderid,
      code: username,
      message: 'Account created successfully',
      // Dhru mostrará estos detalles al cliente
      details: {
        username: username,
        password: password,
        expires: new Date(subscription_end).toLocaleDateString(),
        download: 'https://github.com/tu-repo/releases/latest',
        instructions: 'Download ArepaTool and login with your credentials'
      }
    });

  } catch (error) {
    console.error('PlaceOrder Error:', error);
    return res.status(500).json({
      status: 'ERROR',
      orderid: orderid,
      message: error.message
    });
  }
}

/**
 * VERIFICAR ESTADO DE ORDEN
 */
async function handleCheckStatus(data, res) {
  const { orderid } = data;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('dhru_order_id', orderid)
      .single();

    if (error || !user) {
      return res.status(200).json({
        status: 'PENDING',
        orderid: orderid,
        message: 'Order not found or pending'
      });
    }

    return res.status(200).json({
      status: 'COMPLETED',
      orderid: orderid,
      code: user.username,
      message: 'Account is active',
      details: {
        username: user.username,
        status: user.status,
        expires: new Date(user.subscription_end).toLocaleDateString()
      }
    });

  } catch (error) {
    console.error('CheckStatus Error:', error);
    return res.status(500).json({
      status: 'ERROR',
      orderid: orderid,
      message: error.message
    });
  }
}

/**
 * OBTENER BALANCE (CRÉDITOS DISPONIBLES)
 */
async function handleGetBalance(res) {
  // Sistema de créditos ilimitados
  // Puedes implementar lógica real si necesitas control de créditos
  return res.status(200).json({
    status: 'SUCCESS',
    balance: 999999,
    currency: 'USD'
  });
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function generateUsername(email) {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const random = crypto.randomBytes(2).toString('hex');
  return `${base}_${random}`;
}

function generatePassword() {
  // Generar password seguro de 12 caracteres
  return crypto.randomBytes(6).toString('hex');
}

function calculateExpiration(service) {
  // Determinar duración según el servicio
  // Ajustar según tus servicios en Dhru
  let days = 365; // Por defecto 1 año

  if (service && service.includes('1month')) {
    days = 30;
  } else if (service && service.includes('6month')) {
    days = 180;
  }

  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
