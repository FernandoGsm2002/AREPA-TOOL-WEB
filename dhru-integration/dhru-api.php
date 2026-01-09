<?php
/**
 * DHRU FUSION API - ArepaToolV2 License Activation
 * =================================================
 * 
 * Archivo PHP puro compatible con DHRU Fusion (PHP 5.x legacy)
 * 
 * IMPORTANTE: Este archivo debe estar en un servidor PHP, no Vercel.
 * Opciones de hosting:
 * - 000webhost.com (gratis)
 * - InfinityFree (gratis)
 * - Tu propio servidor
 * 
 * URL: https://tu-servidor.com/dhru-api.php
 */

// ==================== CONFIGURACIÓN ====================
$API_KEY = 'e7f8474a35b264bc688502f348cacb04fc9424251a77da53e217c4c08bccbea4'; // Tu API Key

// Supabase (para conectar a la base de datos)
$SUPABASE_URL = 'https://lumhpjfndlqhexnjmvtu.supabase.co';
$SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bWhwamZuZGxxaGV4bmptdnR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ2NjU2NywiZXhwIjoyMDc5MDQyNTY3fQ.8EGhQmddj46oO-qkBOrAiohGx3d0aFOXK10YSv4-qNM'; // Reemplazar con tu Service Role Key

// ==================== HEADERS ====================
header('Content-Type: application/json');
header('X-Powered-By: DHRU-FUSION');

// ==================== OBTENER PARÁMETROS ====================
$action = isset($_POST['action']) ? strtolower(trim($_POST['action'])) : '';
$key = isset($_POST['key']) ? trim($_POST['key']) : '';
$username = isset($_POST['username']) ? trim($_POST['username']) : '';

// Log para debug
error_log("DHRU API - Action: $action, Key: " . substr($key, 0, 8) . "...");

// ==================== VALIDAR API KEY ====================
if (!empty($API_KEY) && !empty($key) && $key !== $API_KEY) {
    echo json_encode(array(
        'ERROR' => array(
            array('MESSAGE' => 'Authentication Failed')
        )
    ));
    exit;
}

// ==================== ACCIONES ====================

// ACCOUNTINFO
if ($action === 'accountinfo') {
    $response = array(
        'SUCCESS' => array(
            array(
                'message' => 'Your Accout Info',
                'AccoutInfo' => array(
                    'credit' => 999999,
                    'mail' => 'ArepaToolAPI',
                    'currency' => 'USD'
                )
            )
        )
    );
    echo json_encode($response);
    exit;
}

// IMEISERVICELIST (también para Server Services)
if ($action === 'imeiservicelist') {
    $Group = 'ArepaToolV2 (Server Service)';
    
    $ServiceList = array();
    $ServiceList[$Group] = array(
        'GROUPNAME' => $Group,
        'GROUPTYPE' => 'SERVER',
        'SERVICES' => array()
    );
    
    // Servicio 1: Licencia 12 meses
    $SERVICEID = 1;
    $ServiceList[$Group]['SERVICES'][$SERVICEID] = array(
        'SERVICEID' => $SERVICEID,
        'SERVICETYPE' => 'SERVER',
        'SERVICENAME' => 'ArepaToolV2 - Active User (12 month licence)',
        'CREDIT' => 14.99,
        'INFO' => 'Activate user license for 12 months. User must register first.',
        'TIME' => 'Instant',
        'QNT' => 0
    );
    
    // Campo personalizado: Mail
    $CUSTOM = array();
    $CUSTOM[0] = array(
        'type' => 'serviceimei',
        'fieldname' => 'Mail',
        'fieldtype' => 'text',
        'description' => 'Customer email (must be registered at arepa-tool-web.vercel.app)',
        'fieldoptions' => '',
        'required' => 1
    );
    $ServiceList[$Group]['SERVICES'][$SERVICEID]['Requires.Custom'] = $CUSTOM;
    
    $response = array(
        'SUCCESS' => array(
            array(
                'MESSAGE' => 'IMEI Service List',
                'LIST' => $ServiceList
            )
        )
    );
    echo json_encode($response);
    exit;
}

// PLACEIMEIORDER (activar licencia)
if ($action === 'placeimeiorder') {
    // Decodificar parameters
    $parameters = array();
    if (isset($_POST['parameters'])) {
        $decoded = base64_decode($_POST['parameters']);
        if ($decoded !== false) {
            $parameters = json_decode($decoded, true);
            if (!is_array($parameters)) $parameters = array();
        }
    }
    
    // Buscar email
    $email = '';
    
    // Desde customfield
    if (isset($parameters['customfield'])) {
        $cfDecoded = base64_decode($parameters['customfield']);
        if ($cfDecoded !== false) {
            $cf = json_decode($cfDecoded, true);
            if (is_array($cf)) {
                if (isset($cf['Mail'])) $email = $cf['Mail'];
                elseif (isset($cf['mail'])) $email = $cf['mail'];
                elseif (isset($cf['EMAIL'])) $email = $cf['EMAIL'];
                elseif (isset($cf['email'])) $email = $cf['email'];
            }
        }
    }
    
    // Desde POST directo
    if (empty($email)) {
        if (isset($_POST['mail'])) $email = $_POST['mail'];
        elseif (isset($_POST['Mail'])) $email = $_POST['Mail'];
        elseif (isset($_POST['email'])) $email = $_POST['email'];
        elseif (isset($_POST['imei'])) $email = $_POST['imei'];
        elseif (isset($parameters['IMEI'])) $email = $parameters['IMEI'];
    }
    
    $email = strtolower(trim($email));
    error_log("DHRU API - PlaceOrder - Email: $email");
    
    // Validar email
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(array(
            'ERROR' => array(
                array('MESSAGE' => 'Invalid or missing email address')
            )
        ));
        exit;
    }
    
    // Conectar a Supabase via REST API
    $result = supabaseQuery($SUPABASE_URL, $SUPABASE_KEY, 'users', 'email=eq.' . urlencode($email));
    
    if ($result === false || empty($result)) {
        echo json_encode(array(
            'ERROR' => array(
                array('MESSAGE' => 'Email not found. User must register first at: https://arepa-tool-web.vercel.app')
            )
        ));
        exit;
    }
    
    $user = $result[0];
    error_log("DHRU API - User found: " . $user['username']);
    
    // Calcular fecha de expiración
    $now = date('c');
    $expiry = strtotime('+365 days');
    
    if (!empty($user['subscription_end'])) {
        $currentExpiry = strtotime($user['subscription_end']);
        if ($currentExpiry > time()) {
            $expiry = strtotime('+365 days', $currentExpiry);
        }
    }
    
    $orderId = 'AREPA_' . time();
    $expiryDate = date('c', $expiry);
    
    // Actualizar usuario en Supabase
    $updateData = array(
        'status' => 'active',
        'subscription_end' => $expiryDate,
        'dhru_order_id' => $orderId
    );
    
    if (empty($user['activated_at'])) {
        $updateData['activated_at'] = $now;
    }
    
    $updateResult = supabaseUpdate($SUPABASE_URL, $SUPABASE_KEY, 'users', $user['id'], $updateData);
    
    if ($updateResult === false) {
        echo json_encode(array(
            'ERROR' => array(
                array('MESSAGE' => 'Failed to activate license')
            )
        ));
        exit;
    }
    
    error_log("DHRU API - License activated for: " . $user['username']);
    
    $response = array(
        'SUCCESS' => array(
            array(
                'MESSAGE' => 'License activated! User: ' . $user['username'] . ' - Valid until: ' . date('m/d/Y', $expiry),
                'REFERENCEID' => $orderId
            )
        )
    );
    echo json_encode($response);
    exit;
}

// GETIMEIORDER
if ($action === 'getimeiorder') {
    $response = array(
        'SUCCESS' => array(
            array(
                'STATUS' => 4, // 4 = Available/Success
                'CODE' => 'LICENSE_ACTIVATED'
            )
        )
    );
    echo json_encode($response);
    exit;
}

// ACCIÓN DESCONOCIDA
$response = array(
    'ERROR' => array(
        array('MESSAGE' => 'Invalid Action: ' . $action)
    )
);
echo json_encode($response);
exit;

// ==================== FUNCIONES SUPABASE ====================

function supabaseQuery($url, $key, $table, $filter) {
    $endpoint = $url . '/rest/v1/' . $table . '?' . $filter;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'apikey: ' . $key,
        'Authorization: Bearer ' . $key,
        'Content-Type: application/json'
    ));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        error_log("Supabase Query Error: HTTP $httpCode - $response");
        return false;
    }
    
    return json_decode($response, true);
}

function supabaseUpdate($url, $key, $table, $id, $data) {
    $endpoint = $url . '/rest/v1/' . $table . '?id=eq.' . $id;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'apikey: ' . $key,
        'Authorization: Bearer ' . $key,
        'Content-Type: application/json',
        'Prefer: return=minimal'
    ));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 204 && $httpCode !== 200) {
        error_log("Supabase Update Error: HTTP $httpCode - $response");
        return false;
    }
    
    return true;
}
?>
