"""
DHRU FUSION API - ArepaToolV2 License Activation
Python Server - Soporta XML, CUSTOMFIELD base64 y multipart/form-data
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import json
import requests
import re
import base64
import xml.etree.ElementTree as ET

# ==================== CONFIGURACIÓN ====================
PORT = 8080
API_KEY = 'e7f8474a35b264bc688502f348cacb04fc9424251a77da53e217c4c08bccbea4'

SUPABASE_URL = 'https://lumhpjfndlqhexnjmvtu.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bWhwamZuZGxxaGV4bmptdnR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ2NjU2NywiZXhwIjoyMDc5MDQyNTY3fQ.8EGhQmddj46oO-qkBOrAiohGx3d0aFOXK10YSv4-qNM'


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
        # Fallback: regex
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
        # Añadir padding si es necesario
        padding = 4 - len(customfield_b64) % 4
        if padding != 4:
            customfield_b64 += '=' * padding
        
        decoded = base64.b64decode(customfield_b64).decode('utf-8')
        print(f"[DHRU] CUSTOMFIELD decoded: {decoded}")
        
        cf_data = json.loads(decoded)
        
        # Buscar email en el objeto
        email_fields = ['Mail', 'mail', 'MAIL', 'Email', 'email', 'EMAIL']
        for field in email_fields:
            if field in cf_data and cf_data[field]:
                return cf_data[field]
        
    except Exception as e:
        print(f"[DHRU] CUSTOMFIELD decode error: {e}")
    
    return None


class DHRUHandler(BaseHTTPRequestHandler):
    
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
            'SUCCESS': [{'message': 'ArepaTool License API is running'}]
        })
    
    def do_POST(self):
        content_type = self.headers.get('Content-Type', '')
        content_length = int(self.headers.get('Content-Length', 0))
        
        print(f"\n{'='*60}")
        print(f"[DHRU] POST Request")
        print(f"[DHRU] Content-Type: {content_type}")
        
        params = {}
        
        # Query params
        parsed = urlparse(self.path)
        query_params = parse_qs(parsed.query)
        for k, v in query_params.items():
            params[k] = v[0]
        
        # Body
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
        
        print(f"[DHRU] Params keys: {list(params.keys())}")
        
        # Parsear XML en 'parameters'
        if 'parameters' in params and params['parameters']:
            xml_data = parse_xml_parameters(params['parameters'])
            params.update(xml_data)
            print(f"[DHRU] XML data: {xml_data}")
        
        return self.handle_action(params)
    
    def handle_action(self, params):
        action = params.get('action', '').lower()
        key = params.get('key', params.get('apiaccesskey', ''))
        
        if not action:
            action = 'accountinfo'
        
        print(f"[DHRU] >>> Action: {action}")
        
        # Validar API Key
        if key and API_KEY and key != API_KEY:
            return self.send_json_response({
                'ERROR': [{'MESSAGE': 'Authentication Failed'}]
            })
        
        # ACCOUNTINFO
        if action == 'accountinfo':
            print("[DHRU] ✅ accountinfo")
            return self.send_json_response({
                'SUCCESS': [{
                    'message': 'Your Accout Info',
                    'AccoutInfo': {
                        'credit': 999999,
                        'mail': 'ArepaToolAPI',
                        'currency': 'USD'
                    }
                }]
            })
        
        # IMEISERVICELIST
        if action == 'imeiservicelist':
            print("[DHRU] ✅ imeiservicelist")
            
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
                            'CREDIT': 14.99,
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
            print(f"[DHRU] Processing {action}")
            
            email = ''
            
            # 1. Primero buscar en CUSTOMFIELD (base64 encoded JSON)
            if 'CUSTOMFIELD' in params and params['CUSTOMFIELD']:
                email = decode_customfield(params['CUSTOMFIELD'])
                if email:
                    print(f"[DHRU] Email from CUSTOMFIELD: {email}")
            
            # 2. Si no, buscar en campos directos
            if not email:
                email_fields = ['MAIL', 'Mail', 'mail', 'EMAIL', 'Email', 'email', 'IMEI', 'Imei', 'imei']
                for field in email_fields:
                    if field in params and params[field]:
                        email = params[field]
                        print(f"[DHRU] Email from '{field}': {email}")
                        break
            
            # 3. Regex en XML original
            if not email and 'parameters' in params:
                xml_str = params['parameters']
                match = re.search(r'<(?:MAIL|Mail|EMAIL|IMEI)>([^<]+)</(?:MAIL|Mail|EMAIL|IMEI)>', xml_str, re.IGNORECASE)
                if match:
                    email = match.group(1)
                    print(f"[DHRU] Email from regex: {email}")
            
            email = str(email).strip().lower() if email else ''
            print(f"[DHRU] Final email: '{email}'")
            
            if not email or '@' not in email:
                return self.send_json_response({
                    'ERROR': [{'MESSAGE': 'Invalid or missing email'}]
                })
            
            user = self.supabase_query(email)
            
            if not user:
                return self.send_json_response({
                    'ERROR': [{'MESSAGE': f'Email {email} not found. Register at: https://arepa-tool-web.vercel.app'}]
                })
            
            import time
            from datetime import datetime, timedelta
            
            now = datetime.now()
            expiry = now + timedelta(days=365)
            order_id = f"AREPA_{int(time.time())}"
            
            update_result = self.supabase_update(user['id'], {
                'status': 'active',
                'subscription_end': expiry.isoformat(),
                'dhru_order_id': order_id,
                'activated_at': now.isoformat()
            })
            
            if update_result:
                print(f"[DHRU] ✅ License activated for: {user['username']}")
                return self.send_json_response({
                    'SUCCESS': [{
                        'MESSAGE': f"License activated! User: {user['username']} - Valid until: {expiry.strftime('%m/%d/%Y')}",
                        'REFERENCEID': order_id
                    }]
                })
            else:
                return self.send_json_response({
                    'ERROR': [{'MESSAGE': 'Failed to update user'}]
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
                'AccoutInfo': {'credit': 999999, 'mail': 'ArepaToolAPI', 'currency': 'USD'}
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
    
    def supabase_query(self, email):
        try:
            url = f"{SUPABASE_URL}/rest/v1/users?email=eq.{email}"
            headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}
            response = requests.get(url, headers=headers)
            print(f"[DHRU] Supabase query: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else None
        except Exception as e:
            print(f"[DHRU] Supabase error: {e}")
        return None
    
    def supabase_update(self, user_id, data):
        try:
            url = f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}"
            headers = {
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
            response = requests.patch(url, headers=headers, json=data)
            print(f"[DHRU] Supabase update: {response.status_code}")
            return response.status_code in [200, 204]
        except Exception as e:
            print(f"[DHRU] Supabase update error: {e}")
        return False
    
    def log_message(self, format, *args):
        pass


if __name__ == '__main__':
    print("=" * 60)
    print("  DHRU FUSION API - ArepaToolV2")
    print("  Con soporte CUSTOMFIELD base64")
    print("=" * 60)
    print(f"  URL: http://localhost:{PORT}")
    print("=" * 60)
    
    server = HTTPServer(('0.0.0.0', PORT), DHRUHandler)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[DHRU] Servidor detenido")
