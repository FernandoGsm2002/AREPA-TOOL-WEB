import sqlite3
import os

# Paths
analysis_dir = r"C:\Users\Fernando\Desktop\ArepaToolV2\AREPA-TOOL-PANEL\bypass-server\public\analysis\iPhone12-3_B3A9BC8C"
db_path = os.path.join(analysis_dir, "step3_downloads.28.sqlitedb")

print("=" * 70)
print("FULL ASSET ANALYSIS")  
print("=" * 70)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get column names first
cursor.execute("PRAGMA table_info(asset)")
columns = [col[1] for col in cursor.fetchall()]
print(f"Asset columns: {columns}")
print()

# Get all data
cursor.execute("SELECT * FROM asset")
rows = cursor.fetchall()

print(f"Total assets: {len(rows)}")
print()

for i, row in enumerate(rows):
    print(f"{'='*70}")
    print(f"ASSET {i+1}")
    print(f"{'='*70}")
    for j, col in enumerate(columns):
        val = row[j]
        if val is not None and val != '' and val != 0:
            if isinstance(val, bytes):
                val = f"<BLOB {len(val)} bytes>"
            print(f"  {col}: {val}")
    print()

conn.close()
