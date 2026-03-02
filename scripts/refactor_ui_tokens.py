import os
import re

ui_dir = "src/components/ui"

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

# Hex to token
hex_to_color = {
    "'#ffffff'": "'var(--bg-card)'", # Or text-light depending on context, but usually bg in these components
    "'white'": "'var(--text-light)'",
    "'transparent'": "'transparent'",
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Safety: don't format Spinner animations blindly
    if 'Spinner.jsx' in filepath: return
    
    # 1. Spacing and Radii (Padding, Margin, Gap, BorderRadius)
    # We'll use a regex replacement function to intelligently swap px values
    def replace_px(match):
        val = match.group(1)
        if val in pixel_to_space:
            return pixel_to_space[val]
        return val

    # For multi-value paddings like '8px 16px' -> 'var(--space-2) var(--space-4)'
    def replace_multi_px(match):
        full_str = match.group(1) # e.g. "8px 16px"
        # Only replace exact matching pixel strings inside the quote
        for px, tok in pixel_to_space.items():
            clean_px = px.replace("'", "")
            clean_tok = tok.replace("'", "")
            full_str = re.sub(rf'\b{clean_px}\b', clean_tok, full_str)
        return f"'{full_str}'"

    # Replace simple px strings
    content = re.sub(r"('[0-9]+px')", replace_px, content)
    
    # Replace compound px strings like padding: '8px 16px'
    content = re.sub(r"('([0-9]+px\s+[0-9]+px(\s+[0-9]+px)?(\s+[0-9]+px)?))'", replace_multi_px, content)

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
    content = content.replace("fontWeight: '800'", "fontWeight: 'var(--font-extrabold)'")
    
    # 4. Shadows
    content = content.replace("boxShadow: '0 1px 2px 0 rgba(0,0,0,0.15)'", "boxShadow: 'var(--shadow-sm)'")
    content = content.replace("boxShadow: '0 2px 4px 0 rgba(0,0,0,0.15)'", "boxShadow: 'var(--shadow-md)'")
    content = content.replace("boxShadow: '0 4px 8px 0 rgba(0,0,0,0.15)'", "boxShadow: 'var(--shadow-lg)'")
    
    # 5. Motion
    content = content.replace("transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'", "transition: 'all var(--transition-base)'")
    content = content.replace("transition: 'all 0.3s ease'", "transition: 'all var(--transition-base)'")
    content = content.replace("transition: 'color 0.15s'", "transition: 'color var(--transition-fast)'")
    content = content.replace("0.15s", "var(--motion-base)")
    content = content.replace("0.2s", "var(--motion-slow)")
    content = content.replace("0.3s", "var(--motion-slow)")

    with open(filepath, 'w') as f:
        f.write(content)

for filename in os.listdir(ui_dir):
    if filename.endswith(".jsx"):
        process_file(os.path.join(ui_dir, filename))

print("Audit and replace completed.")
