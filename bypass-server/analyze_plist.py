import plistlib

plist_path = r'C:\Users\Fernando\Desktop\ArepaToolV2\rusta12+source\RustA12-bypass-RustA12-v3.1\server\public\Maker\iPhone12-3\com.apple.MobileGestalt.plist'
data = plistlib.load(open(plist_path, 'rb'))

print(f"Top level keys: {list(data.keys())}")
print(f"CacheUUID: {data.get('CacheUUID', 'N/A')}")
print(f"CacheVersion: {data.get('CacheVersion', 'N/A')}")

cache_data = data.get('CacheData')
if isinstance(cache_data, bytes):
    print(f"\nCacheData is bytes: {len(cache_data)} bytes")
    print(f"First 50 bytes: {cache_data[:50]}")
    
    # Try to parse as plist
    try:
        inner = plistlib.loads(cache_data)
        print(f"Inner plist keys: {len(inner) if isinstance(inner, dict) else 'not dict'}")
        if isinstance(inner, dict):
            for k in list(inner.keys())[:10]:
                print(f"  {k}: {type(inner[k])}")
    except:
        print("Could not parse inner plist")
        
        # Check if compressed
        if cache_data[:2] == b'\x1f\x8b':
            print("CacheData is GZIP compressed")
            import gzip
            decompressed = gzip.decompress(cache_data)
            inner = plistlib.loads(decompressed)
            print(f"Decompressed inner keys: {len(inner) if isinstance(inner, dict) else 'not dict'}")
elif isinstance(cache_data, dict):
    print(f"\nCacheData keys: {len(cache_data)}")
    
    # Look for camera keys
    for k in list(cache_data.keys())[:20]:
        print(f"  {k}")
