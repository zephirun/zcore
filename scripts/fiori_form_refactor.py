import os
import re

PAGES_DIR = "/home/ruanf/ZEPH/Z.CORE/src/pages"

def refactor_forms(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 1. Enforce max-width on Forms wrapper if it's too wide or missing
        # We will look for <form or <div className="glass-card"> under a form context
        # Actually, let's look for any container whose style has a gap and is meant to be a form.
        # Safest way: identify standard form submission sections or Form elements.
        
        # Look for <form> tags without a maxWidth
        form_tag = re.compile(r'(<form[^>]*?)(style={{([^}]*)}})?(\s*>)')
        
        def form_replacer(match):
            prefix = match.group(1)
            style_group = match.group(2)
            style_content = match.group(3)
            suffix = match.group(4)
            
            if style_group:
                if 'maxWidth' not in style_content:
                    # Append maxWidth and margin auto
                    new_style = style_content.rstrip() + ", maxWidth: '800px', margin: '0 auto'"
                    return f"{prefix}style={{{new_style}}}{suffix}"
                return match.group(0)
            else:
                return f"{prefix} style={{{{ maxWidth: '800px', margin: '0 auto' }}}}{suffix}"

        content = form_tag.sub(form_replacer, content)

        # 2. Form Actions (Submit buttons) should be right aligned in Fiori.
        # Find div containing buttons with type="submit" and ensure they are right aligned.
        # Often looks like: <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)'... }}>
        # If we see <div something> with a button immediately following
        action_bar_pattern = re.compile(r'(<div[^>]*style={{[^}]*display:\s*[\'"]flex[\'"])([^}]*)(}}[^>]*>)\s*(<Button[^>]*type=[\'"]submit[\'"][^>]*>|.*?)', re.DOTALL)
        
        def form_action_replacer(match):
            prefix = match.group(1)
            middle = match.group(2)
            suffix = match.group(3)
            inner = match.group(4)
            
            # If it's a flex container holding a submit button
            if 'submit' in inner.lower() or 'salvar' in inner.lower():
                if 'justifyContent' not in middle:
                    middle += ", justifyContent: 'flex-end'"
            
            return f"{prefix}{middle}{suffix}\n{inner}"

        content = action_bar_pattern.sub(form_action_replacer, content)

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    modified = 0
    for root, dirs, files in os.walk(PAGES_DIR):
        for file in files:
            if file.endswith('.jsx'):
                if refactor_forms(os.path.join(root, file)):
                    print(f"Refactored Form Layout on: {file}")
                    modified += 1
    print(f"Total modified: {modified}")

if __name__ == "__main__":
    main()
