import sqlite3
import os

# Paths
iremoval_db = r"C:\Users\Fernando\Desktop\ArepaToolV2\AREPA-TOOL-PANEL\bypass-server\public\analysis\iRemovalPRO_working\downloads.28.sqlitedb"
rust_db = r"C:\Users\Fernando\Desktop\ArepaToolV2\AREPA-TOOL-PANEL\bypass-server\public\analysis\iPhone12-3_B3A9BC8C\step3_downloads.28.sqlitedb"

def analyze_db(path, name):
    print(f"\n{'='*70}")
    print(f"{name}")
    print(f"{'='*70}")
    print(f"Size: {os.path.getsize(path)} bytes")
    
    conn = sqlite3.connect(path)
    cursor = conn.cursor()
    
    # Get asset count
    cursor.execute("SELECT COUNT(*) FROM asset")
    count = cursor.fetchone()[0]
    print(f"Asset count: {count}")
    
    # Get column names
    cursor.execute("PRAGMA table_info(asset)")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Get all assets
    cursor.execute("SELECT * FROM asset")
    rows = cursor.fetchall()
    
    for i, row in enumerate(rows):
        print(f"\n--- Asset {i+1} ---")
        row_dict = dict(zip(columns, row))
        
        # Show key fields
        print(f"  url: {row_dict.get('url', 'N/A')}")
        print(f"  local_path: {row_dict.get('local_path', 'N/A')}")
        print(f"  download_token: {row_dict.get('download_token', 'N/A')}")
        
        # Check hash_array
        hash_arr = row_dict.get('hash_array')
        if hash_arr:
            if isinstance(hash_arr, bytes):
                print(f"  hash_array: {hash_arr[:50]}... ({len(hash_arr)} bytes)")
            else:
                print(f"  hash_array: {hash_arr}")
    
    conn.close()

# Analyze both
analyze_db(iremoval_db, "iRemovalPRO (Camera WORKS)")
analyze_db(rust_db, "RustA12+ (Camera BLACK)")
