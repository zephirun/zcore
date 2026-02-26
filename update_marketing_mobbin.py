import os
import glob
import re

marketing_dir = '/home/ruanf/ZEPH/Z.CORE/src/pages/marketing'
files = glob.glob(os.path.join(marketing_dir, '*.jsx'))

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Update titles with specific text uppercase formatting
    content = re.sub(
        r"fontSize:\s*'10px',\s*fontWeight:\s*'600',\s*textTransform:\s*'uppercase',\s*letterSpacing:\s*'0.07em'",
        "fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em'",
        content
    )
    
    # 2. Update Card border-radius
    content = re.sub(
        r"borderRadius:\s*'(10|8)px'",
        "borderRadius: '16px'",
        content
    )
    
    # 3. Increase KPI sizes
    content = re.sub(
        r"fontSize:\s*'26px',\s*fontWeight:\s*'?700'?",
        "fontSize: '28px', fontWeight: '800'",
        content
    )
    
    # 4. Remove heavy box shadows
    content = re.sub(r"boxShadow:\s*'0 4px 12px rgba\(0,0,0,0\.05\)'", "boxShadow: 'none'", content)
    
    # 5. Generic Mobbin specific numeric data overrides
    content = content.replace(
        "fontSize: '24px', fontWeight: '700'", 
        "fontSize: '28px', fontWeight: '800'"
    )
    content = content.replace(
        "fontSize: '18px', fontWeight: '700'", 
        "fontSize: '20px', fontWeight: '800'"
    )
    
    content = content.replace(
        "fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase'",
        "fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em'"
    )

    # 6. Title spans for PageContainer (specific to marketing modules)
    titles_to_executive = [
        "Campanhas e Ofertas",
        "Cronograma de Marketing"
    ]
    
    for t in titles_to_executive:
        content = content.replace(
            f'title="{t}"',
            f'title={{<>{t} <span style={{{{ color: \'var(--text-primary)\', fontWeight: \'var(--font-black)\', opacity: 0.9 }}>Executive</span></>}}'
        )
        
    if content != original_content:
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Updated: {os.path.basename(file_path)}")
    else:
        print(f"No changes needed: {os.path.basename(file_path)}")

print("Marketing mobbin script complete.")
