import os
import glob

files = glob.glob('/home/ruanf/ZEPH/Z.CORE/src/pages/**/*.jsx', recursive=True)

count = 0
for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    if "opacity: 0.9 }>" in content:
        content = content.replace("opacity: 0.9 }>", "opacity: 0.9 }}>")
        with open(file_path, 'w') as f:
            f.write(content)
        count += 1

print(f"Fixed syntax errors in {count} files.")
