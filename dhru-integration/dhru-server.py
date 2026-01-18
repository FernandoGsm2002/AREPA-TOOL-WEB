"""
DHRU FUSION API - ArepaToolV2 License Activation
Con sistema de Resellers y Balance
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import json
import requests
import re
import base64
import xml.etree.ElementTree as ET
from decimal import Decimal

# ==================== CONFIGURACIÓN ====================
PORT = 8080

SUPABASE_URL = 'https://lumhpjfndlqhexnjmvtu.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bWhwamZuZGxxaGV4bmptdnR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ2NjU2NywiZXhwIjoyMDc5MDQyNTY3fQ.8EGhQmddj46oO-qkBOrAiohGx3d0aFOXK10YSv4-qNM'

# Precio por defecto del servicio
DEFAULT_SERVICE_PRICE = 14.99


def parse_multipart(content_type, body):
    """Parsea datos multipart/form-data"""
    params = {}
    
    boundary_match = re.search(r'boundary=([^\s;]+)', content_type)
    if not boundary_match:
        return params
    
    boundary = boundary_match.group(1).encode()
    parts = body.split(b'--' + boundary)
    
    for part in parts:
        if not part or part == b'--\r\n' or part.strip() == b'--':
            continue
        
        if b'\r\n\r\n' in part:
            header_section, content = part.split(b'\r\n\r\n', 1)
            name_match = re.search(rb'name="([^"]+)"', header_section)
            if name_match:
                name = name_match.group(1).decode('utf-8')
                value = content.rstrip(b'\r\n').decode('utf-8', errors='ignore')
                params[name] = value
    
    return params


def parse_xml_parameters(xml_string):
    """Parsea el XML de parámetros de DHRU"""
    result = {}
    
    try:
        xml_string = xml_string.strip()
        if not xml_string.startswith('<'):
            return result
        
        if not xml_string.startswith('<?xml') and not xml_string.startswith('<PARAMETERS'):
            xml_string = f'<ROOT>{xml_string}</ROOT>'
        
        root = ET.fromstring(xml_string)
        
        for elem in root.iter():
            if elem.text and elem.text.strip():
                result[elem.tag] = elem.text.strip()
        
    except Exception as e:
        patterns = [
            (r'<CUSTOMFIELD>([^<]+)</CUSTOMFIELD>', 'CUSTOMFIELD'),
            (r'<MAIL>([^<]+)</MAIL>', 'MAIL'),
            (r'<Mail>([^<]+)</Mail>', 'Mail'),
            (r'<EMAIL>([^<]+)</EMAIL>', 'EMAIL'),
            (r'<IMEI>([^<]+)</IMEI>', 'IMEI'),
            (r'<ID>([^<]+)</ID>', 'ID'),
        ]
        
        for pattern, key in patterns:
            match = re.search(pattern, xml_string, re.IGNORECASE)
            if match:
                result[key] = match.group(1)
    
    return result


def decode_customfield(customfield_b64):
    """Decodifica CUSTOMFIELD de base64 a JSON y extrae el email"""
    try:
        padding = 4 - len(customfield_b64) % 4
        if padding != 4:
            customfield_b64 += '=' * padding
        
        decoded = base64.b64decode(customfield_b64).decode('utf-8')
        cf_data = json.loads(decoded)
        
        email_fields = ['Mail', 'mail', 'MAIL', 'Email', 'email', 'EMAIL']
        for field in email_fields:
            if field in cf_data and cf_data[field]:
                return cf_data[field]
        
    except Exception as e:
        print(f"[DHRU] CUSTOMFIELD decode error: {e}")
    
    return None


class SupabaseClient:
    """Cliente para interactuar con Supabase"""
    
    def __init__(self):
        self.url = SUPABASE_URL
        self.headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json'
        }
    
    def get_reseller(self, api_key=None, username=None):
        """Obtiene un reseller por API Key o username"""
        try:
            if api_key:
                url = f"{self.url}/rest/v1/resellers?api_key=eq.{api_key}&status=eq.active"
            elif username:
                url = f"{self.url}/rest/v1/resellers?username=eq.{username}&status=eq.active"
            else:
                return None
            
            response = requests.get(url, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else None
        except Exception as e:
            print(f"[DHRU] Error getting reseller: {e}")
        return None
    
    def get_user(self, email):
        """Obtiene un usuario por email"""
        try:
            url = f"{self.url}/rest/v1/users?email=eq.{email}"
            response = requests.get(url, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else None
        except Exception as e:
            print(f"[DHRU] Error getting user: {e}")
        return None
    
    def update_user(self, user_id, data):
        """Actualiza un usuario"""
        try:
            url = f"{self.url}/rest/v1/users?id=eq.{user_id}"
            headers = {**self.headers, 'Prefer': 'return=minimal'}
            response = requests.patch(url, headers=headers, json=data)
            return response.status_code in [200, 204]
        except Exception as e:
            print(f"[DHRU] Error updating user: {e}")
        return False
    
    def deduct_balance(self, reseller_id, amount, order_id, description):
        """Descuenta saldo del reseller y registra la transacción"""
        try:
            # Obtener reseller actual
            url = f"{self.url}/rest/v1/resellers?id=eq.{reseller_id}"
            response = requests.get(url, headers=self.headers)
            if response.status_code != 200:
                return False, 0
            
            reseller = response.json()[0]
            current_balance = float(reseller['balance'])
            
            if current_balance < amount:
                return False, current_balance
            
            new_balance = current_balance - amount
            
            # Actualizar balance
            update_url = f"{self.url}/rest/v1/resellers?id=eq.{reseller_id}"
            update_data = {
                'balance': new_balance,
                'total_orders': reseller['total_orders'] + 1,
                'updated_at': 'now()'
            }
            headers = {**self.headers, 'Prefer': 'return=minimal'}
            requests.patch(update_url, headers=headers, json=update_data)
            
            # Registrar transacción
            tx_url = f"{self.url}/rest/v1/reseller_transactions"
            tx_data = {
                'reseller_id': reseller_id,
                'type': 'debit',
                'amount': amount,
                'balance_after': new_balance,
                'description': description,
                'order_id': order_id
            }
            requests.post(tx_url, headers=self.headers, json=tx_data)
            
            return True, new_balance
            
        except Exception as e:
            print(f"[DHRU] Error deducting balance: {e}")
        return False, 0


class DHRUHandler(BaseHTTPRequestHandler):
    
    db = SupabaseClient()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        parsed = urlparse(self.path)
        query_params = parse_qs(parsed.query)
        params = {k: v[0] for k, v in query_params.items()}
        
        if params.get('action'):
            return self.handle_action(params)
        
        self.send_json_response({
            'SUCCESS': [{'message': 'ArepaTool License API v2.0 - Reseller System'}]
        })
    
    def do_POST(self):
        content_type = self.headers.get('Content-Type', '')
        content_length = int(self.headers.get('Content-Length', 0))
        
        print(f"\n{'='*60}")
        print(f"[DHRU] POST Request")
        
        params = {}
        
        parsed = urlparse(self.path)
        query_params = parse_qs(parsed.query)
        for k, v in query_params.items():
            params[k] = v[0]
        
        body = self.rfile.read(content_length) if content_length > 0 else b''
        
        if 'multipart/form-data' in content_type:
            multipart_params = parse_multipart(content_type, body)
            params.update(multipart_params)
        elif body:
            try:
                body_params = parse_qs(body.decode('utf-8'))
                for k, v in body_params.items():
                    params[k] = v[0]
            except:
                pass
        
        if 'parameters' in params and params['parameters']:
            xml_data = parse_xml_parameters(params['parameters'])
            params.update(xml_data)
        
        return self.handle_action(params)
    
    def handle_action(self, params):
        action = params.get('action', '').lower()
        api_key = params.get('key', params.get('apiaccesskey', ''))
        username = params.get('username', '')
        
        if not action:
            action = 'accountinfo'
        
        print(f"[DHRU] Action: {action} | User: {username}")
        
        # Validar reseller
        reseller = None
        if api_key:
            reseller = self.db.get_reseller(api_key=api_key)
        elif username:
            reseller = self.db.get_reseller(username=username)
        
        if not reseller:
            print(f"[DHRU] ❌ Invalid API Key or Username")
            return self.send_json_response({
                'ERROR': [{'MESSAGE': 'Authentication Failed - Invalid API Key'}]
            })
        
        print(f"[DHRU] ✅ Reseller: {reseller['name']} | Balance: ${reseller['balance']}")
        
        # ACCOUNTINFO
        if action == 'accountinfo':
            return self.send_json_response({
                'SUCCESS': [{
                    'message': 'Your Accout Info',
                    'AccoutInfo': {
                        'credit': float(reseller['balance']),
                        'mail': reseller['email'] or reseller['username'],
                        'currency': 'USD'
                    }
                }]
            })
        
        # IMEISERVICELIST
        if action == 'imeiservicelist':
            service_price = float(reseller.get('service_price', DEFAULT_SERVICE_PRICE))
            
            group = 'ArepaToolV2 (Server Service)'
            
            ServiceList = {
                group: {
                    'GROUPNAME': group,
                    'GROUPTYPE': 'SERVER',
                    'SERVICES': {
                        1: {
                            'SERVICEID': 1,
                            'SERVICETYPE': 'SERVER',
                            'SERVICENAME': 'ArepaToolV2 - Active User (12 month licence)',
                            'CREDIT': service_price,
                            'INFO': 'Activate license for 12 months.',
                            'TIME': 'Instant',
                            'QNT': 0,
                            'Requires.Custom': [{
                                'type': 'serviceimei',
                                'fieldname': 'Mail',
                                'fieldtype': 'text',
                                'description': 'Customer email',
                                'fieldoptions': '',
                                'required': 1
                            }]
                        }
                    }
                }
            }
            
            return self.send_json_response({
                'SUCCESS': [{
                    'MESSAGE': 'IMEI Service List',
                    'LIST': ServiceList
                }]
            })
        
        # PLACEIMEIORDER / PLACESERVERORDER
        if action in ['placeimeiorder', 'placeserverorder']:
            print(f"[DHRU] Processing order for {reseller['name']}")
            
            # Obtener email
            email = ''
            
            if 'CUSTOMFIELD' in params and params['CUSTOMFIELD']:
                email = decode_customfield(params['CUSTOMFIELD'])
            
            if not email:
                email_fields = ['MAIL', 'Mail', 'mail', 'EMAIL', 'Email', 'email', 'IMEI', 'Imei', 'imei']
                for field in email_fields:
                    if field in params and params[field]:
                        email = params[field]
                        break
            
            email = str(email).strip().lower() if email else ''
            print(f"[DHRU] Customer email: '{email}'")
            
            if not email or '@' not in email:
                return self.send_json_response({
                    'ERROR': [{'MESSAGE': 'Invalid or missing email'}]
                })
            
            # Verificar que el usuario existe
            user = self.db.get_user(email)
            
            if not user:
                return self.send_json_response({
                    'ERROR': [{'MESSAGE': f'Email {email} no encontrado.Primero debes registrarse en: https://www.arepatool.com/register.html'}]
                })
            
            # Verificar saldo
            service_price = float(reseller.get('service_price', DEFAULT_SERVICE_PRICE))
            current_balance = float(reseller['balance'])
            
            if current_balance < service_price:
                return self.send_json_response({
                    'ERROR': [{'MESSAGE': f'Insufficient balance. Required: ${service_price}, Available: ${current_balance}'}]
                })
            
            import time
            from datetime import datetime, timedelta
            
            now = datetime.now()
            expiry = now + timedelta(days=365)
            order_id = f"AREPA_{int(time.time())}"
            
            # Descontar saldo
            success, new_balance = self.db.deduct_balance(
                reseller['id'],
                service_price,
                order_id,
                f"License activation for {email}"
            )
            
            if not success:
                return self.send_json_response({
                    'ERROR': [{'MESSAGE': 'Failed to process payment'}]
                })
            
            # Activar usuario
            self.db.update_user(user['id'], {
                'status': 'active',
                'subscription_end': expiry.isoformat(),
                'dhru_order_id': order_id,
                'activated_at': now.isoformat()
            })
            
            print(f"[DHRU] ✅ Order complete! User: {user['username']} | New balance: ${new_balance}")
            
            return self.send_json_response({
                'SUCCESS': [{
                    'MESSAGE': f"License activated! User: {user['username']} - Valid until: {expiry.strftime('%m/%d/%Y')}. New balance: ${new_balance:.2f}",
                    'REFERENCEID': order_id
                }]
            })
        
        # GETIMEIORDER
        if action in ['getimeiorder', 'getserverorder']:
            return self.send_json_response({
                'SUCCESS': [{'STATUS': 4, 'CODE': 'LICENSE_ACTIVATED'}]
            })
        
        # Default
        return self.send_json_response({
            'SUCCESS': [{
                'message': 'Your Accout Info',
                'AccoutInfo': {
                    'credit': float(reseller['balance']),
                    'mail': reseller['email'] or reseller['username'],
                    'currency': 'USD'
                }
            }]
        })
    
    def send_json_response(self, data):
        response = json.dumps(data)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(response))
        self.send_header('X-Powered-By', 'DHRU-FUSION')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(response.encode('utf-8'))
    
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def log_message(self, format, *args):
        pass


if __name__ == '__main__':
    print("=" * 60)
    print("  DHRU FUSION API - ArepaToolV2")
    print("  Sistema de Resellers con Balance")
    print("=" * 60)
    print(f"  URL: http://localhost:{PORT}")
    print(f"  API: https://api.arepatool.com")
    print("=" * 60)
    
    server = HTTPServer(('0.0.0.0', PORT), DHRUHandler)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[DHRU] Servidor detenido")
