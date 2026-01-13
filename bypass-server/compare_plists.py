import plistlib
import os

# Paths
original_plist = r'C:\Users\Fernando\Desktop\ArepaToolV2\AREPA-TOOL-PANEL\bypass-server\public\analysis\iPhone12-3_B3A9BC8C\original_server_MobileGestalt.plist'
local_plist = r'C:\Users\Fernando\Desktop\ArepaToolV2\rusta12+source\RustA12-bypass-RustA12-v3.1\server\public\Maker\iPhone12-3\com.apple.MobileGestalt.plist'

orig = plistlib.load(open(original_plist, 'rb'))
local = plistlib.load(open(local_plist, 'rb'))

print('=== ORIGINAL (Server) ===')
print('Size: 8,523 bytes')
print('Keys:', list(orig.keys()))
print('CacheVersion:', orig.get('CacheVersion', 'N/A'))
print('CacheUUID:', orig.get('CacheUUID', 'N/A'))

cache_data_orig = orig.get('CacheData')
if cache_data_orig:
    print('CacheData size:', len(cache_data_orig), 'bytes')

print()
print('=== LOCAL (Source) ===')
print('Size: 10,478 bytes')
print('Keys:', list(local.keys()))
print('CacheVersion:', local.get('CacheVersion', 'N/A'))
print('CacheUUID:', local.get('CacheUUID', 'N/A'))

cache_data_local = local.get('CacheData')
if cache_data_local:
    print('CacheData size:', len(cache_data_local), 'bytes')

print()
print('=== COMPARISON ===')
print('CacheVersion match:', orig.get('CacheVersion') == local.get('CacheVersion'))
print('CacheData size difference:', len(cache_data_local) - len(cache_data_orig), 'bytes')
