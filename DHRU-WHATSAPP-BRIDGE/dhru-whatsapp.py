"""
DHRU TELEGRAM BOT - BRIDGE INTELLIGENT
Recepción Automática + Gestión vía Telegram (Responder mensajes)

Comandos para responder en Telegram:
- DONE / LISTO -> Marca pedido como EXITOSO
- REJECT / RECHAZAR -> Marca pedido como RECHAZADO
"""

import sys
import io
# Forzar UTF-8 en stdout/stderr (necesario en Windows Server con CP1252)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import json
import os
import time
import requests
import re
import base64
import threading
import xml.etree.ElementTree as ET
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración
PORT = int(os.getenv('PORT', 8095))
API_KEY = os.getenv('API_KEY', '')
DHRU_CALLBACK_URL = os.getenv('DHRU_CALLBACK_URL', '')  # URL del panel DHRU para callback
DB_FILE = 'orders_db.json'

# ========== CONFIGURACIÓN DE MENSAJERÍA ==========
# WhatsApp (ACTIVO por defecto)
WHATSAPP_ENABLED = os.getenv('WHATSAPP_ENABLED', 'true').lower() == 'true'
WHATSAPP_SERVICE_URL = os.getenv('WHATSAPP_SERVICE_URL', 'http://localhost:3001')

# Telegram (DESACTIVADO - mantenido como backup)
TELEGRAM_ENABLED = os.getenv('TELEGRAM_ENABLED', 'false').lower() == 'true'
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '')

MESSAGE_TEMPLATE = os.getenv('MESSAGE_TEMPLATE', "🚨 *NUEVO PEDIDO RECIBIDO*\n--------------------------------\n📦 *Servicio:* {service}\n📱 *IMEI:* `{imei}`\n--------------------------------\n✅ *Estado:* En Proceso Haganlo!\n\n_Responde DONE para completar_\nRef: {order_id}")

# ==================== GESTIÓN DE BASE DE DATOS ====================

def load_db():
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_db(data):
    try:
        with open(DB_FILE, 'w') as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"❌ Error guardando DB: {e}")

# Base de datos en memoria para acceso rápido
db_lock = threading.Lock()
orders_memory = load_db()

def update_order_status(order_id, status, code_message):
    with db_lock:
        if str(order_id) in orders_memory:
            orders_memory[str(order_id)]['status'] = status # 4=Success, 3=Rejected
            orders_memory[str(order_id)]['code'] = code_message
            save_db(orders_memory)
            return True
    return False

def get_order_status(order_id):
    with db_lock:
        order = orders_memory.get(str(order_id))
        if order:
            return order.get('status', 2), order.get('code', 'Procesando...')
    return 2, 'No encontrado'

def get_order_data(order_id):
    """Obtiene todos los datos de un pedido"""
    with db_lock:
        return orders_memory.get(str(order_id), {})

def dhru_callback(order_id, status, code):
    """
    Hace callback al panel DHRU origen para notificar el cambio de estado.
    DHRU tiene un endpoint interno: /api.php?action=updateimeiorder
    """
    if not DHRU_CALLBACK_URL:
        print("   ⚠️ DHRU_CALLBACK_URL no configurado - no se puede hacer callback")
        return False
    
    order_data = get_order_data(order_id)
    if not order_data:
        print(f"   ❌ Pedido {order_id} no encontrado en DB")
        return False
    
    dhru_username = order_data.get('dhru_username', '')
    dhru_apikey = order_data.get('dhru_apikey', '')
    
    if not dhru_username or not dhru_apikey:
        print(f"   ⚠️ Sin credenciales DHRU guardadas para pedido {order_id}")
        return False
    
    # Construir el callback a DHRU
    # DHRU espera: action=updateimeiorder con los datos del pedido
    callback_url = f"{DHRU_CALLBACK_URL}/api.php"
    
    payload = {
        'username': dhru_username,
        'apiaccesskey': dhru_apikey,
        'action': 'updateimeiorder',
        'id': str(order_id),
        'status': status,  # 4=Success, 3=Rejected
        'code': code
    }
    
    print(f"\n📤 [DHRU CALLBACK] Enviando actualización a {DHRU_CALLBACK_URL}")
    print(f"   📦 Order: {order_id} -> Status: {status}")
    
    try:
        response = requests.post(callback_url, data=payload, timeout=10)
        print(f"   📥 Respuesta: {response.status_code} - {response.text[:100]}")
        
        if response.status_code == 200:
            print("   ✅ Callback exitoso!")
            return True
        else:
            print(f"   ❌ Error en callback: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
        return False

# ==================== PARSING UTILS ====================
# (Funciones reutilizadas para entender DHRU)

def parse_multipart(content_type, body):
    params = {}
    boundary_match = re.search(r'boundary=([^\s;]+)', content_type)
    if not boundary_match: return params
    boundary = boundary_match.group(1).encode()
    parts = body.split(b'--' + boundary)
    for part in parts:
        if not part or part == b'--\r\n' or part.strip() == b'--': continue
        if b'\r\n\r\n' in part:
            header_section, content = part.split(b'\r\n\r\n', 1)
            name_match = re.search(rb'name="([^"]+)"', header_section)
            if name_match:
                name = name_match.group(1).decode('utf-8')
                value = content.rstrip(b'\r\n').decode('utf-8', errors='ignore')
                params[name] = value
    return params

def parse_xml_parameters(xml_string):
    result = {}
    try:
        xml_string = xml_string.strip()
        if not xml_string.startswith('<'): return result
        if not xml_string.startswith('<?xml') and not xml_string.startswith('<PARAMETERS'):
            xml_string = f'<ROOT>{xml_string}</ROOT>'
        root = ET.fromstring(xml_string)
        for elem in root.iter():
            if elem.text and elem.text.strip(): result[elem.tag] = elem.text.strip()
    except:
        pass # Fallback regex omitido por brevedad, usar lógica anterior si es crítico
    return result

def decode_customfield(customfield_b64):
    """Decodifica CUSTOMFIELD de base64 a JSON y devuelve todos los campos"""
    try:
        if not customfield_b64: return {}
        padding = 4 - len(customfield_b64) % 4
        if padding != 4: customfield_b64 += '=' * padding
        decoded = base64.b64decode(customfield_b64).decode('utf-8')
        print(f"   📋 CUSTOMFIELD decodificado: {decoded}")
        try:
            cf_data = json.loads(decoded)
            if isinstance(cf_data, dict):
                return cf_data  # Devolver TODO el diccionario
        except: 
            return {'raw': decoded}
    except Exception as e:
        print(f"   ⚠️ Error decodificando CUSTOMFIELD: {e}")
        return {}
    return {}

# ==================== TELEGRAM LISTENER (SEGUNDO PLANO) ====================

def telegram_listener():
    """Escucha mensajes de Telegram para actualizar pedidos"""
    print("🎧 Iniciando escucha de Telegram...")
    last_update_id = 0
    
    while True:
        try:
            time.sleep(3) # Polling cada 3 segundos
            if not TELEGRAM_BOT_TOKEN: continue

            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates?offset={last_update_id + 1}&timeout=10"
            resp = requests.get(url, timeout=15)
            data = resp.json()
            
            if not data.get('ok'): continue
            
            for result in data.get('result', []):
                last_update_id = result['update_id']
                message = result.get('message', {})
                text = message.get('text', '').upper().strip()
                
                print(f"📩 Debug Telegram: Recibido '{text}' de {message.get('from', {}).get('first_name')}")
                
                # Verificar si es respuesta a un mensaje
                reply_to = message.get('reply_to_message')
                
                if reply_to:
                    original_text = reply_to.get('text', '')
                    print(f"   ↳ Es respuesta a mensaje original:")
                    print(f"   📄 Texto completo: {repr(original_text[:100])}...")
                    
                    if text in ['DONE', 'LISTO', 'REJECT', 'RECHAZAR', 'OK']:
                        # IMPORTANTE: Telegram QUITA el formato Markdown cuando devuelve reply_to_message
                        # Así que el texto llega como "🆔 Ref: 1234567890" (sin asteriscos ni backticks)
                        
                        # Patrón principal: buscar "Ref:" seguido de un número de 10 dígitos (timestamp)
                        match = re.search(r'Ref:?\s*`?(\d{10,})`?', original_text)
                        
                        # Fallback: buscar cualquier número largo en el mensaje (el timestamp)
                        if not match:
                            match = re.search(r'(\d{10,})', original_text)
                        
                        if match:
                            order_id = match.group(1)
                            print(f"   ✅ ID ENCONTRADO: {order_id}")
                            user_chat_id = message['chat']['id']
                            
                            new_status = 2
                            response_text = ""
                            code_message = ""
                            
                            if text in ['DONE', 'LISTO', 'OK']:
                                new_status = 4 # Success
                                code_message = "Completado exitosamente ✅"
                                update_order_status(order_id, 4, code_message)
                                
                                # Hacer callback a DHRU
                                callback_ok = dhru_callback(order_id, 4, code_message)
                                if callback_ok:
                                    response_text = f"✅ Pedido {order_id} COMPLETADO y sincronizado con DHRU."
                                else:
                                    response_text = f"✅ Pedido {order_id} marcado como COMPLETADO (callback pendiente)."
                                
                            elif text in ['REJECT', 'RECHAZAR']:
                                new_status = 3 # Rejected
                                code_message = "Pedido rechazado por admin 🚫"
                                update_order_status(order_id, 3, code_message)
                                
                                # Hacer callback a DHRU
                                callback_ok = dhru_callback(order_id, 3, code_message)
                                if callback_ok:
                                    response_text = f"🚫 Pedido {order_id} RECHAZADO y sincronizado con DHRU."
                                else:
                                    response_text = f"🚫 Pedido {order_id} marcado como RECHAZADO (callback pendiente)."
                            
                            # Confirmar en Telegram
                            send_telegram_msg(user_chat_id, response_text)
                            print(f"🔄 Pedido {order_id} actualizado a estado {new_status}")
                        else:
                            print("   ⚠️ NO SE ENCONTRÓ ID EN EL MENSAJE ORIGINAL")
                else:
                    if text in ['DONE', 'LISTO']:
                        print("   ⚠️ El mensaje NO ES UNA RESPUESTA (Reply). Debes responder al mensaje del bot.")
                
                # ========== MANEJAR CALLBACK DE BOTONES ==========
                callback_query = result.get('callback_query')
                if callback_query:
                    callback_data = callback_query.get('data', '')
                    callback_chat_id = callback_query['message']['chat']['id']
                    callback_id = callback_query['id']
                    
                    print(f"🔘 Botón presionado: {callback_data}")
                    
                    if callback_data.startswith('copy_'):
                        # Extraer el texto para copiar (guardado en orders_memory)
                        order_id = callback_data.replace('copy_', '')
                        
                        # Buscar datos del pedido
                        order_data = get_order_data(order_id)
                        if order_data:
                            imei = order_data.get('imei', '')
                            service_id = order_data.get('service', '')
                            custom_fields = order_data.get('custom_fields', {})
                            
                            services_names = {
                                '1': 'CLARO COLOMBIA',
                                '2': 'MOVISTAR COLOMBIA', 
                                '3': 'TIGO COLOMBIA',
                                '4': 'SISTEMA CLARO PERU',
                                '5': 'NO REGISTRO BITEL',
                                '6': 'NO REGISTRO SOLO IMEI',
                                '7': 'LISTA BLANCA PERU'
                            }
                            s_name = services_names.get(str(service_id), f"SERVICIO {service_id}")
                            
                            # Construir texto para copiar
                            copy_text = f"{s_name}\n{imei}"
                            
                            # Si es BITEL (service 5), agregar número
                            if str(service_id) == '5' and custom_fields:
                                numero_bitel = custom_fields.get('Numero Bitel', '')
                                if numero_bitel:
                                    copy_text += f"\n{numero_bitel}"
                            
                            # Enviar texto copiable
                            send_telegram_msg(callback_chat_id, f"```\n{copy_text}\n```", parse_mode='Markdown')
                            
                            # Responder al callback para quitar el "loading" del botón
                            answer_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery"
                            requests.post(answer_url, json={'callback_query_id': callback_id, 'text': '✅ Info copiable enviada'})
                        else:
                            # Responder error
                            answer_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery"
                            requests.post(answer_url, json={'callback_query_id': callback_id, 'text': '❌ Pedido no encontrado'})

        except Exception as e:
            print(f"⚠️ Error en listener Telegram: {e}")
            time.sleep(5)

# ==================== FUNCIONES DE MENSAJERÍA ====================

def send_whatsapp_msg(message, group_name=None):
    """Envía mensaje a WhatsApp a través del servicio Node.js"""
    if not WHATSAPP_ENABLED:
        return False
    
    try:
        url = f"{WHATSAPP_SERVICE_URL}/send"
        payload = {'message': message}
        if group_name:
            payload['groupName'] = group_name
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            target = f" -> grupo '{group_name}'" if group_name else ""
            print(f"   📱 WhatsApp: Mensaje enviado!{target}")
            return True
        else:
            print(f"   ⚠️ WhatsApp: Error {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ WhatsApp: Servicio no disponible (inicia START-WHATSAPP.bat)")
        return False
    except Exception as e:
        print(f"   ❌ WhatsApp: Error - {e}")
        return False

def send_telegram_msg(chat_id, text, parse_mode='Markdown'):
    if not TELEGRAM_ENABLED:
        return False
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        requests.post(url, json={'chat_id': chat_id, 'text': text, 'parse_mode': parse_mode})
        return True
    except: 
        return False

def send_telegram_with_copy_button(chat_id, text, copy_text, parse_mode='Markdown'):
    """Envía mensaje con botón que al presionarlo envía el texto para copiar"""
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        
        # Crear inline keyboard con botón de copiar
        # Usamos callback_data para manejar el clic
        keyboard = {
            'inline_keyboard': [[
                {'text': '📋 Copiar Info', 'callback_data': f'copy_{copy_text[:60]}'}  # Limitamos a 60 chars por límite de Telegram
            ]]
        }
        
        requests.post(url, json={
            'chat_id': chat_id, 
            'text': text, 
            'parse_mode': parse_mode,
            'reply_markup': keyboard
        })
    except Exception as e:
        print(f"Error enviando mensaje con botón: {e}")

# ==================== SERVIDOR DHRU ====================

class DHRUHandler(BaseHTTPRequestHandler):
    
    def log_message(self, format, *args): pass

    def _send_response(self, data):
        try:
            response = json.dumps(data).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('X-Powered-By', 'DHRU-BOT')
            self.end_headers()
            self.wfile.write(response)
        except: pass

    def do_GET(self):
        """Manejar peticiones GET (navegador o sincronización)"""
        from urllib.parse import parse_qs, urlparse
        
        parsed = urlparse(self.path)
        query_params = parse_qs(parsed.query)
        
        # Extraer action de query params
        action = query_params.get('action', [''])[0].lower()
        
        if action:
            # Convertir query params a formato simple
            params = {k: v[0] for k, v in query_params.items()}
            self.handle_action(action, params)
        else:
            # Página de estado para navegador
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            html = """
            <html>
            <head><title>DHRU WhatsApp Bridge</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px; background: #1a1a2e; color: white;">
                <h1>📱 DHRU WhatsApp Bridge</h1>
                <p style="font-size: 24px; color: #4CAF50;">✅ Servidor Activo</p>
                <p>Puerto: 8095</p>
                <p>Este servidor recibe pedidos de DHRU y los envía a WhatsApp.</p>
            </body>
            </html>
            """
            self.wfile.write(html.encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        params = {}
        
        try:
            # Parseo más robusto de parámetros
            content_type = self.headers.get('Content-Type', '')
            
            # ========== WEBHOOK DE WHATSAPP ==========
            if self.path == '/webhook' and 'application/json' in content_type:
                try:
                    webhook_data = json.loads(body.decode('utf-8'))
                    order_id = webhook_data.get('order_id')
                    action = webhook_data.get('action')  # 'complete' o 'reject'
                    user = webhook_data.get('user', 'WhatsApp')
                    
                    print(f"\n📱 [WHATSAPP WEBHOOK] Recibido: {action} para pedido {order_id}")
                    
                    if order_id and action:
                        if action == 'complete':
                            code_message = webhook_data.get('code', '')
                            if not code_message:
                                code_message = "Servicio Completado Con Exito ✅"
                                
                            update_order_status(order_id, 4, code_message)
                            # Hacer callback a DHRU
                            dhru_callback(order_id, 4, code_message)
                            print(f"   ✅ Pedido {order_id} marcado como COMPLETADO (Cod: {code_message})")
                        elif action == 'reject':
                            reason = webhook_data.get('reason', '')
                            code_message = reason if reason else 'Rechazado por Admin 🚫'
                            update_order_status(order_id, 3, code_message)
                            dhru_callback(order_id, 3, code_message)
                            print(f"   🚫 Pedido {order_id} RECHAZADO — {code_message}")
                        
                        return self._send_response({'success': True})
                    
                    return self._send_response({'error': 'Missing order_id or action'})
                except Exception as e:
                    print(f"   ❌ Error procesando webhook: {e}")
                    return self._send_response({'error': str(e)})
            
            if b'multipart/form-data' in content_type.encode():
                params = parse_multipart(content_type, body)
            else:
                body_decoded = body.decode('utf-8', errors='ignore')
                params = {k: v[0] for k, v in parse_qs(body_decoded).items()}
            
            # Decodificar XML de parámetros si existe
            if params.get('parameters'): 
                xml_params = parse_xml_parameters(params['parameters'])
                params.update(xml_params)
                
        except Exception as e:
            print(f"Error parsing POST: {e}")

        action = params.get('action', '').lower()
        self.handle_action(action, params)

    def handle_action(self, action, params):
        # Log para debug de acciones
        print(f"📨 Action recibida: {action}")
        
        # --- INFO CUENTA ---
        if action == 'accountinfo':
            return self._send_response({'SUCCESS': [{'AccoutInfo': {'credit': 999999.00, 'mail': 'bot', 'currency': 'USD'}}]})
        
        # --- LISTA SERVICIOS (Server Services - similar a ArepaTool) ---
        elif action == 'imeiservicelist':
            group = 'LeoPe-Gsm (Server Service)'
            
            ServiceList = {
                group: {
                    'GROUPNAME': group,
                    'GROUPTYPE': 'SERVER',
                    'SERVICES': {
                        201: {
                            'SERVICEID': 201,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'FRP — MOTOROLA (MTK / SPD)',
                            'CREDIT': 0.00,
                            'INFO': 'FRP removal for Motorola MTK/SPD devices',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [{
                                'type': 'serviceimei',
                                'fieldname': 'IP',
                                'fieldtype': 'text',
                                'description': 'TeamViewer ID',
                                'fieldoptions': '',
                                'required': 1
                            }]
                        },
                        202: {
                            'SERVICEID': 202,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'Xiaomi FRP + Reset',
                            'CREDIT': 0.00,
                            'INFO': 'FRP + Factory Reset for Xiaomi devices',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [{
                                'type': 'serviceimei',
                                'fieldname': 'IP',
                                'fieldtype': 'text',
                                'description': 'TeamViewer ID',
                                'fieldoptions': '',
                                'required': 1
                            }]
                        },
                        203: {
                            'SERVICEID': 203,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'Repair IMEI Motorola G15 / G05 / E15',
                            'CREDIT': 0.00,
                            'INFO': 'IMEI repair for Motorola G15/G05/E15',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [
                                {'type': 'serviceimei', 'fieldname': 'IP', 'fieldtype': 'text', 'description': 'TeamViewer ID', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'MODEL', 'fieldtype': 'text', 'description': 'Model', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'SN', 'fieldtype': 'text', 'description': 'Serial Number', 'fieldoptions': '', 'required': 1}
                            ]
                        },
                        204: {
                            'SERVICEID': 204,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'Repair IMEI G23 / G13 / E13',
                            'CREDIT': 0.00,
                            'INFO': 'IMEI repair for Motorola G23/G13/E13',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [
                                {'type': 'serviceimei', 'fieldname': 'IP', 'fieldtype': 'text', 'description': 'TeamViewer ID', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'MODEL', 'fieldtype': 'text', 'description': 'Model', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'SN', 'fieldtype': 'text', 'description': 'Serial Number', 'fieldoptions': '', 'required': 1}
                            ]
                        },
                        205: {
                            'SERVICEID': 205,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'Repair IMEI Motorola MTK/SPD',
                            'CREDIT': 0.00,
                            'INFO': 'IMEI repair for Motorola MTK/SPD chipset',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [
                                {'type': 'serviceimei', 'fieldname': 'IP', 'fieldtype': 'text', 'description': 'TeamViewer ID', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'MODEL', 'fieldtype': 'text', 'description': 'Model', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'SN', 'fieldtype': 'text', 'description': 'Serial Number', 'fieldoptions': '', 'required': 1}
                            ]
                        },
                        206: {
                            'SERVICEID': 206,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'Chimera Tool Basic 12 Months Activation',
                            'CREDIT': 0.00,
                            'INFO': 'Chimera Tool Basic license activation',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [
                                {'type': 'serviceimei', 'fieldname': 'Username', 'fieldtype': 'text', 'description': 'Chimera Username', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'Password', 'fieldtype': 'text', 'description': 'Chimera Password', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'Ultraviewer', 'fieldtype': 'text', 'description': 'Ultraviewer iD / Pass', 'fieldoptions': '', 'required': 1}
                            ]
                        },
                        207: {
                            'SERVICEID': 207,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'Chimera Tool Premium 12 Months Activation',
                            'CREDIT': 0.00,
                            'INFO': 'Chimera Tool Premium license activation',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [
                                {'type': 'serviceimei', 'fieldname': 'Username', 'fieldtype': 'text', 'description': 'Chimera Username', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'Password', 'fieldtype': 'text', 'description': 'Chimera Password', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'Ultraviewer', 'fieldtype': 'text', 'description': 'Ultraviewer iD / Pass', 'fieldoptions': '', 'required': 1}
                            ]
                        },
                        208: {
                            'SERVICEID': 208,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'Chimera Tool Professional 12 Months Activation',
                            'CREDIT': 0.00,
                            'INFO': 'Chimera Tool Professional license activation',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [
                                {'type': 'serviceimei', 'fieldname': 'Username', 'fieldtype': 'text', 'description': 'Chimera Username', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'Password', 'fieldtype': 'text', 'description': 'Chimera Password', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'Ultraviewer', 'fieldtype': 'text', 'description': 'Ultraviewer iD / Pass', 'fieldoptions': '', 'required': 1}
                            ]
                        },
                        209: {
                            'SERVICEID': 209,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'FRP — MOTOROLA (Qualcomm) (All Models Support) - Remote Service ⚡️',
                            'CREDIT': 0.00,
                            'INFO': 'FRP removal for Motorola Qualcomm devices (All Models)',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [{
                                'type': 'serviceimei',
                                'fieldname': 'IP',
                                'fieldtype': 'text',
                                'description': 'TeamViewer ID',
                                'fieldoptions': '',
                                'required': 1
                            }]
                        },
                        210: {
                            'SERVICEID': 210,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'Octoplus Credits New User🐙',
                            'CREDIT': 0.00,
                            'INFO': 'Octoplus credits para nuevo usuario',
                            'TIME': '1-24 Hours',
                            'QNT': 1,
                            'Requires.Custom': [
                                {'type': 'serviceimei', 'fieldname': 'TARGETLOGIN', 'fieldtype': 'text', 'description': 'Login nuevo', 'fieldoptions': '', 'required': 1},
                                {'type': 'serviceimei', 'fieldname': 'TARGETPASSWORD', 'fieldtype': 'text', 'description': 'Password nuevo', 'fieldoptions': '', 'required': 1}
                            ]
                        },
                        211: {
                            'SERVICEID': 211,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'Octoplus credits Exist User🐙',
                            'CREDIT': 0.00,
                            'INFO': 'Octoplus credits para usuario existente',
                            'TIME': '1-24 Hours',
                            'QNT': 1,
                            'Requires.Custom': [
                                {'type': 'serviceimei', 'fieldname': 'TARGETUSER', 'fieldtype': 'text', 'description': 'Usuario existente', 'fieldoptions': '', 'required': 1}
                            ]
                        }
                    }
                },
                'LeoPe-Gsm (IMEI Service)': {
                    'GROUPNAME': 'LeoPe-Gsm (IMEI Service)',
                    'GROUPTYPE': 'IMEI',
                    'SERVICES': {
                        301: {
                            'SERVICEID': 301,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'No Registro Tigo 🇨🇴',
                            'CREDIT': 0.00,
                            'INFO': 'No Registro Tigo Colombia',
                            'TIME': '1-24 Hours',
                            'QNT': 0
                        },
                        302: {
                            'SERVICEID': 302,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'SISTEMA CLARO 🔴',
                            'CREDIT': 0.00,
                            'INFO': 'Sistema Claro Colombia',
                            'TIME': '1-24 Hours',
                            'QNT': 0
                        },
                        303: {
                            'SERVICEID': 303,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'Imei no se encuentra en lista blanca 🇵🇪',
                            'CREDIT': 0.00,
                            'INFO': 'IMEI no registrado en lista blanca Peru',
                            'TIME': '1-24 Hours',
                            'QNT': 0
                        },
                        304: {
                            'SERVICEID': 304,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'Preventivo solo IMEI 🇵🇪',
                            'CREDIT': 0.00,
                            'INFO': 'Preventivo solo IMEI Peru (IMEI + Numero)',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [{
                                'type': 'serviceimei',
                                'fieldname': 'Numero',
                                'fieldtype': 'text',
                                'description': 'Numero de telefono',
                                'fieldoptions': '',
                                'required': 1
                            }]
                        },
                        305: {
                            'SERVICEID': 305,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'Preventivo Bitel 🇵🇪',
                            'CREDIT': 0.00,
                            'INFO': 'Preventivo Bitel Peru (IMEI + Numero)',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [{
                                'type': 'serviceimei',
                                'fieldname': 'Numero',
                                'fieldtype': 'text',
                                'description': 'Numero de telefono',
                                'fieldoptions': '',
                                'required': 1
                            }]
                        },
                        306: {
                            'SERVICEID': 306,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'No Registro Claro Colombia 🇨🇴',
                            'CREDIT': 0.00,
                            'INFO': 'No Registro Claro Colombia',
                            'TIME': '1-24 Hours',
                            'QNT': 0
                        },
                        307: {
                            'SERVICEID': 307,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'No Registro Movistar Colombia 🇨🇴',
                            'CREDIT': 0.00,
                            'INFO': 'No Registro Movistar Colombia',
                            'TIME': '1-24 Hours',
                            'QNT': 0
                        },
                        308: {
                            'SERVICEID': 308,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'Xiaomi Colombia - Xiaomi Account Clean 🇨🇴',
                            'CREDIT': 0.00,
                            'INFO': 'Limpieza de cuenta Xiaomi Colombia',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [{
                                'type': 'serviceimei',
                                'fieldname': 'Lockcode',
                                'fieldtype': 'text',
                                'description': 'Lockcode del dispositivo',
                                'fieldoptions': '',
                                'required': 1
                            }]
                        },
                        309: {
                            'SERVICEID': 309,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'Xiaomi Peru - Mi Account Clean 🇵🇪',
                            'CREDIT': 0.00,
                            'INFO': 'Limpieza de cuenta Xiaomi Peru (IMEI + Lockcode)',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [{
                                'type': 'serviceimei',
                                'fieldname': 'Lockcode',
                                'fieldtype': 'text',
                                'description': 'Lockcode del dispositivo',
                                'fieldoptions': '',
                                'required': 1
                            }]
                        },
                        310: {
                            'SERVICEID': 310,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'Entel Recuperado 🔵',
                            'CREDIT': 0.00,
                            'INFO': 'Entel Recuperado (IMEI + Numero)',
                            'TIME': '1-24 Hours',
                            'QNT': 0,
                            'Requires.Custom': [{
                                'type': 'serviceimei',
                                'fieldname': 'Numero',
                                'fieldtype': 'text',
                                'description': 'Numero de telefono',
                                'fieldoptions': '',
                                'required': 1
                            }]
                        },
                        401: {
                            'SERVICEID': 401,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'FRP V5 (S Series & Z Fold & Flip) ✅',
                            'CREDIT': 0.00,
                            'INFO': 'FRP V5 (S Series & Z Fold & Flip)',
                            'TIME': '1-24 Hours',
                            'QNT': 0
                        },
                        402: {
                            'SERVICEID': 402,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'FRP V5 (A Series & M, F Series High) ✅',
                            'CREDIT': 0.00,
                            'INFO': 'FRP V5 (A Series & M, F Series High)',
                            'TIME': '1-24 Hours',
                            'QNT': 0
                        },
                        403: {
                            'SERVICEID': 403,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': 'FRP V5 (A Series & M, F Series Low) ✅️',
                            'CREDIT': 0.00,
                            'INFO': 'FRP V5 (A Series & M, F Series Low)',
                            'TIME': '1-24 Hours',
                            'QNT': 0
                        },
                        404: {
                            'SERVICEID': 404,
                            'SERVICETYPE': 'IMEI',
                            'SERVICENAME': '⚠️Samsung FRP V5 Premium Verify And Refund⚠️',
                            'CREDIT': 0.00,
                            'INFO': 'Samsung FRP V5 Premium - Verify and refund if not applicable',
                            'TIME': '1-24 Hours',
                            'QNT': 0
                        }
                    }
                }
            }
            
            return self._send_response({
                'SUCCESS': [{
                    'MESSAGE': 'IMEI Service List',
                    'LIST': ServiceList
                }]
            })

        # --- LISTA SERVICIOS REMOTOS (REMOTE SERVICES) ---
        # Esta es la ACTION que DHRU usa para poblar el dropdown en Remote Services
        elif action == 'remoteservicelist':
            print("📋 [DHRU] Solicitando remoteservicelist")
            return self._send_response({
                'SUCCESS': [{
                    'MESSAGE': 'Remote Service List',
                    'LIST': {
                        'Remote Services LeoPe': {
                            'GROUPNAME': 'Remote Services LeoPe',
                            'GROUPTYPE': 'REMOTE',
                            'SERVICES': {
                                201: {
                                    'SERVICEID': 201, 
                                    'SERVICETYPE': 'REMOTE',
                                    'SERVICENAME': 'FRP — MOTOROLA (MTK / SPD) (Check supported models) - Remote Service ⚡️', 
                                    'CREDIT': 0.00, 
                                    'QNT': 0, 
                                    'Requires.Custom': [
                                        {'type': 'serviceremote', 'fieldname': 'IP', 'fieldtype': 'text', 'required': 1}
                                    ]
                                },
                                202: {
                                    'SERVICEID': 202, 
                                    'SERVICETYPE': 'REMOTE',
                                    'SERVICENAME': 'Xiaomi FRP + Reset - Remote Service ⚡', 
                                    'CREDIT': 0.00, 
                                    'QNT': 0, 
                                    'Requires.Custom': [
                                        {'type': 'serviceremote', 'fieldname': 'IP', 'fieldtype': 'text', 'required': 1}
                                    ]
                                },
                                203: {
                                    'SERVICEID': 203, 
                                    'SERVICETYPE': 'REMOTE',
                                    'SERVICENAME': 'Repair IMEI Motorola  G15 / G05 / E15  - Remote Service ⚡️', 
                                    'CREDIT': 0.00, 
                                    'QNT': 0, 
                                    'Requires.Custom': [
                                        {'type': 'serviceremote', 'fieldname': 'IP', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceremote', 'fieldname': 'MODEL', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceremote', 'fieldname': 'SN', 'fieldtype': 'text', 'required': 1}
                                    ]
                                },
                                204: {
                                    'SERVICEID': 204, 
                                    'SERVICETYPE': 'REMOTE',
                                    'SERVICENAME': 'Repair IMEI G23 / G13 / E13  - Remote Service ⚡', 
                                    'CREDIT': 0.00, 
                                    'QNT': 0, 
                                    'Requires.Custom': [
                                        {'type': 'serviceremote', 'fieldname': 'IP', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceremote', 'fieldname': 'MODEL', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceremote', 'fieldname': 'SN', 'fieldtype': 'text', 'required': 1}
                                    ]
                                },
                                205: {
                                    'SERVICEID': 205, 
                                    'SERVICETYPE': 'REMOTE',
                                    'SERVICENAME': 'Repair IMEI Motorola MTK/SPD - Remote Services ⚡', 
                                    'CREDIT': 0.00, 
                                    'QNT': 0, 
                                    'Requires.Custom': [
                                        {'type': 'serviceremote', 'fieldname': 'IP', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceremote', 'fieldname': 'MODEL', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceremote', 'fieldname': 'SN', 'fieldtype': 'text', 'required': 1}
                                    ]
                                }
                            }
                        }
                    }
                }]
            })

        # --- LISTA SERVICIOS DE SERVIDOR (REMOTE) ---
        elif action == 'serverservicelist':
            return self._send_response({
                'SUCCESS': [{
                    'MESSAGE': 'Server Service List',
                    'LIST': {
                        'Remote Services LeoPe': {
                            'GROUPNAME': 'Remote Services LeoPe',
                            'GROUPTYPE': 'SERVER',
                            'SERVICES': {
                                201: {
                                    'SERVICEID': 201, 
                                    'SERVICENAME': 'FRP — MOTOROLA (MTK / SPD) (Check supported models) - Remote Service ⚡️', 
                                    'CREDIT': 0.00, 
                                    'QNT': 0, 
                                    'Requires.Custom': [
                                        {'type': 'serviceserver', 'fieldname': 'IP', 'fieldtype': 'text', 'required': 1}
                                    ]
                                },
                                202: {
                                    'SERVICEID': 202, 
                                    'SERVICENAME': 'Xiaomi FRP + Reset - Remote Service ⚡', 
                                    'CREDIT': 0.00, 
                                    'QNT': 0, 
                                    'Requires.Custom': [
                                        {'type': 'serviceserver', 'fieldname': 'IP', 'fieldtype': 'text', 'required': 1}
                                    ]
                                },
                                203: {
                                    'SERVICEID': 203, 
                                    'SERVICENAME': 'Repair IMEI Motorola  G15 / G05 / E15  - Remote Service ⚡️', 
                                    'CREDIT': 0.00, 
                                    'QNT': 0, 
                                    'Requires.Custom': [
                                        {'type': 'serviceserver', 'fieldname': 'IP', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceserver', 'fieldname': 'MODEL', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceserver', 'fieldname': 'SN', 'fieldtype': 'text', 'required': 1}
                                    ]
                                },
                                204: {
                                    'SERVICEID': 204, 
                                    'SERVICENAME': 'Repair IMEI G23 / G13 / E13  - Remote Service ⚡', 
                                    'CREDIT': 0.00, 
                                    'QNT': 0, 
                                    'Requires.Custom': [
                                        {'type': 'serviceserver', 'fieldname': 'IP', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceserver', 'fieldname': 'MODEL', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceserver', 'fieldname': 'SN', 'fieldtype': 'text', 'required': 1}
                                    ]
                                },
                                205: {
                                    'SERVICEID': 205, 
                                    'SERVICENAME': 'Repair IMEI Motorola MTK/SPD - Remote Services ⚡', 
                                    'CREDIT': 0.00, 
                                    'QNT': 0, 
                                    'Requires.Custom': [
                                        {'type': 'serviceserver', 'fieldname': 'IP', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceserver', 'fieldname': 'MODEL', 'fieldtype': 'text', 'required': 1},
                                        {'type': 'serviceserver', 'fieldname': 'SN', 'fieldtype': 'text', 'required': 1}
                                    ]
                                }
                            }
                        }
                    }
                }]
            })

        # --- NUEVO PEDIDO ---
        elif action in ['placeimeiorder', 'placeserverorder']:
            imei = params.get('imei', params.get('IMEI', ''))
            
            # Buscar el Service ID en varios lugares
            service_id = params.get('serviceid', params.get('SERVICEID'))
            if not service_id or service_id == '0':
                # A veces viene en el XML parameters
                service_id = params.get('ID', '0')
            
            # Extraer QNT (Cantidad)
            qnt = params.get('qnt', params.get('QNT', '1'))
            
            # Decodificar TODOS los campos personalizados
            custom_fields = decode_customfield(params.get('CUSTOMFIELD'))
            if not isinstance(custom_fields, dict):
                custom_fields = {}
                
            # Solo agregar QNT para los servicios de Octoplus (210 y 211)
            if str(service_id) in ['210', '211'] and qnt and str(qnt) not in ['0', '']:
                custom_fields['QNT (Cantidad)'] = str(qnt)
            
            # Extraer email si existe
            email = custom_fields.get('Mail') or custom_fields.get('email') or custom_fields.get('Email') or ''
            
            # Capturar info del DHRU origen para callback
            dhru_username = params.get('username', '')
            dhru_apikey = params.get('apiaccesskey', params.get('key', ''))
            
            # Usar timestamp como ID único
            order_id = int(time.time())
            
            print(f"\n📥 [NUEVO PEDIDO] ID: {order_id}")
            print(f"   📱 IMEI/QNT: {imei} / {qnt}")
            print(f"   🔧 Service: {service_id}")
            print(f"   👤 DHRU User: {dhru_username}")
            print(f"   📋 Custom Fields: {custom_fields}")
            
            # Guardar en DB con info del DHRU origen
            with db_lock:
                orders_memory[str(order_id)] = {
                    'imei': imei,
                    'service': service_id,
                    'status': 2, # In Process
                    'created_at': time.time(),
                    'dhru_username': dhru_username,
                    'dhru_apikey': dhru_apikey,
                    'custom_fields': custom_fields
                }
                save_db(orders_memory)
            
            # Notificar (pasamos custom_fields completo)
            self.notify_telegram(imei, service_id, email, order_id, custom_fields)
            
            return self._send_response({'SUCCESS': [{'MESSAGE': 'Order Received', 'REFERENCEID': order_id}]})

        # --- CONSULTAR ESTADO ---
        elif action in ['getimeiorder', 'getserverorder']:
            # Logs silenciados para evitar spam en consola
            response_list = []
            
            # Buscar IDs solicitados
            request_xml = params.get('parameters', '') or ''
            requested_ids = re.findall(r'<ID>(\d+)</ID>', request_xml)
            
            # También buscar en REFERENCEID
            if not requested_ids:
                requested_ids = re.findall(r'<REFERENCEID>(\d+)</REFERENCEID>', request_xml)
            
            if not requested_ids and params.get('ID'):
                requested_ids = [params.get('ID')]
            if not requested_ids and params.get('REFERENCEID'):
                requested_ids = [params.get('REFERENCEID')]
            
            # ESTRATEGIA:
            # 1. Si DHRU pide IDs específicos, respondemos esos.
            # 2. Si DHRU no pide nada (polling general), le damos TODOS los que han cambiado estado (Success/Reject).
            
            if requested_ids:
                for ref_id in requested_ids:
                    status, code = get_order_status(ref_id)
                    item = {'REFERENCEID': ref_id, 'STATUS': status, 'CODE': code}
                    # Algunos DHRU viejos esperan 'ID' en lugar de 'REFERENCEID'
                    item['ID'] = ref_id 
                    response_list.append(item)
            else:
                # Devolver todos los pedidos COMPLETADOS o RECHAZADOS recientes
                with db_lock:
                    for oid, data in orders_memory.items():
                        # Si está finalizado (4 o 3), lo enviamos para que DHRU actualice
                        if data['status'] in [3, 4]:
                            item = {
                                'REFERENCEID': oid,
                                'ID': oid,
                                'STATUS': data['status'],
                                'CODE': data.get('code', 'Procesado')
                            }
                            response_list.append(item)
            
            if not response_list:
                # Si no hay nada que reportar, enviamos éxito vacío o un dummy pendiente si se requiere
                return self._send_response({'SUCCESS': []})

            return self._send_response({'SUCCESS': response_list})

        else:
            return self._send_response({'ERROR': [{'MESSAGE': 'Invalid Action'}]})

    def notify_telegram(self, imei, service_id, email, order_id, custom_fields=None):
        # IMEI Services (IDs 300+)
        imei_services_names = {
            '301': '🇨🇴 No Registro Tigo',
            '302': '🔴 SISTEMA CLARO',
            '303': '🇵🇪 Imei no se encuentra en lista blanca',
            '304': '🇵🇪 Preventivo entel Peru',
            '305': '🇵🇪 Preventivo Bitel',
            '306': '🇨🇴 No Registro Claro Colombia',
            '307': '🇨🇴 No Registro Movistar Colombia',
            '308': '🇨🇴 Xiaomi Colombia - Xiaomi Account Clean',
            '309': '🇵🇪 Xiaomi Peru - Mi Account Clean',
            '310': 'Entel Recuperado 🔵',
            '401': 'FRP V5 (S Series & Z Fold & Flip) ✅',
            '402': 'FRP V5 (A Series & M, F Series High) ✅',
            '403': 'FRP V5 (A Series & M, F Series Low) ✅️',
            '404': '⚠️Samsung FRP V5 Premium Verify And Refund⚠️',
        }
        
        # Mapeo de service ID -> grupo de WhatsApp
        imei_group_routing = {
            '301': 'Tigo Nuevo',
            '302': 'NUEVO SISTEMA CLARO',
            '303': 'Procesos LeoPe-Gsm',
            '304': 'Registro Preventivo Entel 🔵',
            '305': 'PREVENTIVO BITEL AQUI',
            '306': 'Kurama Claro Procesos 🔴',
            '307': 'Leo Registro Claro & MOVISTAR Colombia',
            '308': 'Xiaomi Colombia Procesos 🇨🇴',
            '309': 'XIAOMI HOY ACA',
            '310': 'SISTEMA ENTEL RECUPERADO ✅',
            '401': 'Sam FRP V5 BUG✅',
            '402': 'Sam FRP V5 BUG✅',
            '403': 'Sam FRP V5 BUG✅',
            '404': 'Sam FRP V5 BUG✅',
        }
        
        # Server Services
        server_services_names = {
            '201': '⚡ FRP — MOTOROLA (MTK / SPD)',
            '202': '⚡ Xiaomi FRP + Reset',
            '203': '⚡ Repair IMEI Motorola G15 / G05 / E15',
            '204': '⚡ Repair IMEI G23 / G13 / E13',
            '205': '⚡ Repair IMEI Motorola MTK/SPD',
            '206': '🔧 Chimera Tool Basic 12 Months',
            '207': '🔧 Chimera Tool Premium 12 Months',
            '208': '🔧 Chimera Tool Professional 12 Months',
            '209': '⚡ FRP — MOTOROLA (Qualcomm) All Models',
            '210': 'Octoplus Credits New User🐙',
            '211': 'Octoplus credits Exist User🐙',
        }
        
        # Mapeo de service ID -> grupo de WhatsApp (solo los que NO van al grupo por defecto)
        server_group_routing = {
            '209': 'Moto Qcom Orders 🟢',
            '210': 'Octoplus Creditos 🐙',
            '211': 'Octoplus Creditos 🐙',
        }
        
        sid = str(service_id)
        is_imei_service = sid in imei_services_names
        
        # ========== CONSTRUIR MENSAJE ==========
        if is_imei_service:
            s_name = imei_services_names.get(sid, f"IMEI Service #{service_id}")
            msg = f"{s_name}\nIMEI: {imei}"
            
            # El 303 omite todos los campos extras (incluyendo QNT)
            if sid != '303':
                if custom_fields and isinstance(custom_fields, dict):
                    skip_fields = ['Mail', 'mail', 'email', 'Email', 'raw']
                    for field_name, field_value in custom_fields.items():
                        if field_name not in skip_fields and field_value:
                            msg += f"\n{field_name}: {field_value}"
        else:
            # Server Service: mensaje compacto
            s_name = server_services_names.get(sid, f"Servicio #{service_id}")
            msg = f"{s_name}"
            
            # Agregar campos personalizados
            if custom_fields and isinstance(custom_fields, dict):
                skip_fields = ['Mail', 'mail', 'email', 'Email', 'raw']
                for field_name, field_value in custom_fields.items():
                    if field_name not in skip_fields and field_value:
                        display_name = field_name.replace('_', ' ').title()
                        msg += f"\n{display_name}: {field_value}"
        
        # El Ref siempre es necesario para que el bot pueda detectar qué pedido se responde
        msg += f"\nRef: {order_id}"
        
        # ========== ENVIAR NOTIFICACIÓN ==========
        notification_sent = False
        
        # 1. Intentar WhatsApp primero (prioridad)
        if WHATSAPP_ENABLED:
            whatsapp_msg = msg.replace('*', '').replace('`', '').replace('_', '')
            
            if is_imei_service:
                # IMEI Services -> grupo según routing
                target_group = imei_group_routing.get(sid, 'Procesos LeoPe-Gsm')
                notification_sent = send_whatsapp_msg(whatsapp_msg, group_name=target_group)
            else:
                # Server Services -> grupo por defecto o routing específico
                target_group = server_group_routing.get(sid)
                notification_sent = send_whatsapp_msg(whatsapp_msg, group_name=target_group)
        
        # 2. Si WhatsApp falló o está desactivado, intentar Telegram
        if not notification_sent and TELEGRAM_ENABLED:
            try:
                url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
                
                keyboard = {
                    'inline_keyboard': [[
                        {'text': '📋 Copiar Info', 'callback_data': f'copy_{order_id}'}
                    ]]
                }
                
                requests.post(url, json={
                    'chat_id': TELEGRAM_CHAT_ID, 
                    'text': msg, 
                    'parse_mode': 'Markdown',
                    'reply_markup': keyboard
                })
                notification_sent = True
            except Exception as e:
                print(f"Error enviando a Telegram: {e}")
        
        if notification_sent:
            target = "grupo Tigo Nuevo" if is_imei_service else "grupo general"
            print(f"✅ Notificado ({target}): {imei}")
        else:
            print(f"⚠️ No se pudo notificar: {imei} (verifica WhatsApp/Telegram)")

if __name__ == '__main__':
    print("="*50)
    print(f"🚀 DHRU BOT INTELIGENTE ACTIVO - PUERTO {PORT}")
    print("="*50)
    print("\n� CONFIGURACIÓN DE MENSAJERÍA:")
    
    if WHATSAPP_ENABLED:
        print(f"   ✅ WhatsApp: ACTIVO ({WHATSAPP_SERVICE_URL})")
        print("      ⚠️ Asegúrate de ejecutar START-WHATSAPP.bat")
    else:
        print("   ❌ WhatsApp: Desactivado")
    
    if TELEGRAM_ENABLED:
        print(f"   ✅ Telegram: ACTIVO")
    else:
        print("   💤 Telegram: Desactivado (backup)")
    
    print("\n📝 Responde a los mensajes con:")
    print("   'DONE' / 'LISTO' -> Completar")
    print("   'REJECT' / 'RECHAZAR' -> Rechazar")
    print("="*50)
    
    # Iniciar Listener de Telegram solo si está activo
    if TELEGRAM_ENABLED:
        tg_thread = threading.Thread(target=telegram_listener, daemon=True)
        tg_thread.start()
        print("🎧 Listener de Telegram iniciado")
    
    # Iniciar servidor
    print(f"\n🌐 Servidor escuchando en puerto {PORT}...")
    server = HTTPServer(('0.0.0.0', PORT), DHRUHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido")

