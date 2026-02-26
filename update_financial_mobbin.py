import os
import glob
import re

financial_dir = '/home/ruanf/ZEPH/Z.CORE/src/pages/financial'
files = glob.glob(os.path.join(financial_dir, '*.jsx'))

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Update KPICard titles (if any exist locally in these files)
    # Most are in components, but just in case:
    content = re.sub(
        r"fontSize: '10px',\s*fontWeight: '600',\s*textTransform: 'uppercase',\s*letterSpacing: '0.07em',",
        "fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em',",
        content
    )
    
    # 2. Update Card inner padding to 24px and border-radius to 16px
    # (Regex to find inline styles that might look like Cards if missing the component)
    content = re.sub(
        r"borderRadius:\s*'(10|8)px'",
        "borderRadius: '16px'",
        content
    )
    
    # 3. Increase KPI metric sizes
    content = re.sub(
        r"fontSize:\s*'26px',\s*fontWeight:\s*'?700'?",
        "fontSize: '28px', fontWeight: '800'",
        content
    )
    
    # 4. Give PageContainer titles the "Executive" span if they have a specific title string
    # E.g. title="Resumo do Cliente"
    # To be safe, we only add it to the main prominent pages, like ClientSummary
    if "ClientSummary.jsx" in file_path:
        content = content.replace(
            'title="Ficha do Cliente"',
            'title={<>Ficha do Cliente <span style={{ color: \'var(--text-primary)\', fontWeight: \'var(--font-black)\', opacity: 0.9 }}>Executive</span></>}'
        )
        content = content.replace(
            'title="Resumo do Cliente"',
            'title={<>Resumo do Cliente <span style={{ color: \'var(--text-primary)\', fontWeight: \'var(--font-black)\', opacity: 0.9 }}>Executive</span></>}'
        )

    # 5. Clean up heavy boxShadows
    content = re.sub(r"boxShadow:\s*'0 4px 12px rgba\(0,0,0,0\.05\)'", "boxShadow: 'none'", content)
    
    # 6. Apply to any hardcoded "KPI" structures in the code that weren't caught by the previous passes
    # Such as explicit divs with numeric values that are large
    content = content.replace(
        "fontSize: '24px', fontWeight: '700'", 
        "fontSize: '28px', fontWeight: '800'"
    )
    
    content = content.replace(
        "fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase'",
        "fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em'"
    )
    
    if content != original_content:
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Updated: {os.path.basename(file_path)}")
    else:
        print(f"No changes needed: {os.path.basename(file_path)}")

print("Financial mobbin script complete.")
