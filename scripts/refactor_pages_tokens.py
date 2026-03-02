import os
import re

ui_dir = "src/pages"

# Map of pixel values to their closest token
pixel_to_space = {
    "'4px'": "'var(--space-1)'",
    "'8px'": "'var(--space-2)'",
    "'12px'": "'var(--space-3)'",
    "'16px'": "'var(--space-4)'",
    "'20px'": "'var(--space-5)'",
    "'24px'": "'var(--space-6)'",
    "'32px'": "'var(--space-8)'",
    "'40px'": "'var(--space-10)'",
    "'48px'": "'var(--space-12)'",
    "'64px'": "'var(--space-16)'",
}

pixel_to_text = {
    "'11px'": "'var(--text-xs)'",
    "'12px'": "'var(--text-sm)'",
    "'14px'": "'var(--text-base)'",
    "'16px'": "'var(--text-lg)'",
    "'18px'": "'var(--text-xl)'",
    "'20px'": "'var(--text-2xl)'",
    "'24px'": "'var(--text-3xl)'",
    "'28px'": "'var(--text-4xl)'",
}

# Hex to token - Be very careful not to overwrite semantic chart colors, 
# so we match exact common background definitions
bg_colors = [
    "'#ffffff'", "'#fff'", "'white'",
    "'#f5f7fa'", "'#f9fafb'", "'#f1f5f9'"
]

border_colors = [
    "'#e5e7eb'", "'#e2e8f0'", "'#d1d5db'", "'#dddddd'", "'#eee'", "'#eaeaea'", "'#ccc'"
]

text_colors = [
    "'#111111'", "'#1e293b'", "'#0f172a'", "'#333'", "'#111'"
]
text_muted = [
    "'#64748b'", "'#475569'", "'#6b7280'", "'#666'", "'#888'"
]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 1. Spacing and Radii (Padding, Margin, Gap, BorderRadius)
    def replace_px(match):
        val = match.group(1)
        if val in pixel_to_space:
            return pixel_to_space[val]
        return val

    # Replace simple px strings
    content = re.sub(r"('[0-9]+px')", replace_px, content)

    # 2. Typography
    def replace_text_px(match):
        val = match.group(1)
        if val in pixel_to_text:
            return pixel_to_text[val]
        return val
        
    content = re.sub(r"fontSize:\s*('[0-9]+px')", lambda m: f"fontSize: {replace_text_px(m)}", content)

    # 3. Weights
    content = content.replace("fontWeight: '400'", "fontWeight: 'var(--font-normal)'")
    content = content.replace("fontWeight: '500'", "fontWeight: 'var(--font-medium)'")
    content = content.replace("fontWeight: '600'", "fontWeight: 'var(--font-semibold)'")
    content = content.replace("fontWeight: '700'", "fontWeight: 'var(--font-bold)'")
    # '800' left alone unless it's strictly a match, sometimes 800 is a chart weight

    # 4. Background Colors
    for color in bg_colors:
        # Match background: '#ffffff'
        content = content.replace(f"background: {color}", "background: 'var(--bg-card)'")
        content = content.replace(f"backgroundColor: {color}", "backgroundColor: 'var(--bg-card)'")
        
    # 5. Text Colors
    for color in text_colors:
        content = content.replace(f"color: {color}", "color: 'var(--text-main)'")
    for color in text_muted:
        content = content.replace(f"color: {color}", "color: 'var(--text-muted)'")

    # 6. Borders
    for color in border_colors:
        content = content.replace(color, "'var(--border-color)'")
        
    # 7. Elevation 
    content = content.replace("boxShadow: '0 1px 3px rgba(0,0,0,0.1)'", "boxShadow: 'var(--shadow-sm)'")
    content = content.replace("boxShadow: '0 4px 6px rgba(0,0,0,0.1)'", "boxShadow: 'var(--shadow-md)'")

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk(ui_dir):
    for filename in files:
        if filename.endswith(".jsx"):
            process_file(os.path.join(root, filename))

print("Audit and replace across pages completed.")
