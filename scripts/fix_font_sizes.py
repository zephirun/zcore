import os
import re

ui_dir = "src/pages"

# Quick inverted mapping for space to text
space_to_text = {
    "'var(--space-1)'": "'var(--text-xs)'",     # 4px (a bit weird but okay)
    "'var(--space-2)'": "'var(--text-xs)'",     # 8px -> xs
    "'var(--space-3)'": "'var(--text-xs)'",     # 12px -> xs/sm
    "'var(--space-4)'": "'var(--text-base)'",   # 16px
    "'var(--space-5)'": "'var(--text-xl)'",     # 20px
    "'var(--space-6)'": "'var(--text-3xl)'",    # 24px
    "'var(--space-8)'": "'var(--text-4xl)'",    # 32px
    "'var(--space-10)'": "'var(--text-4xl)'",   # 40px
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to find: fontSize: 'var(--space-3)'
    # and replace with: fontSize: 'var(--text-sm)'
    
    # Custom tweaks for specific replacements based on the values above
    content = content.replace("fontSize: 'var(--space-1)'", "fontSize: 'var(--text-xs)'")
    content = content.replace("fontSize: 'var(--space-2)'", "fontSize: 'var(--text-xs)'")
    content = content.replace("fontSize: 'var(--space-3)'", "fontSize: 'var(--text-sm)'")
    content = content.replace("fontSize: 'var(--space-4)'", "fontSize: 'var(--text-lg)'")
    content = content.replace("fontSize: 'var(--space-5)'", "fontSize: 'var(--text-2xl)'")
    content = content.replace("fontSize: 'var(--space-6)'", "fontSize: 'var(--text-3xl)'")
    content = content.replace("fontSize: 'var(--space-8)'", "fontSize: 'var(--text-4xl)'")
    content = content.replace("fontSize: 'var(--space-10)'", "fontSize: 'var(--text-4xl)'")

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk(ui_dir):
    for filename in files:
        if filename.endswith(".jsx"):
            process_file(os.path.join(root, filename))

print("Typography correction completed.")
