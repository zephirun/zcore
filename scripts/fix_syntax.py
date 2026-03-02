import os
import re

PAGES_DIR = "/home/ruanf/ZEPH/Z.CORE/src/pages"

def fix_style_syntax(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # The previous script produced: style={ display: 'flex', ... }
        # It needs to be: style={{ display: 'flex', ... }}
        # Regex to find style={ followed by a word (like display) instead of a brace
        
        # We need to replace style={ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '800px', margin: '0 auto'}
        # with style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '800px', margin: '0 auto'}}
        
        # Find style={ display: 'flex'...} where it doesn't have double braces
        # We are looking for matching: style={ [a-zA-Z]... } and replacing with style={{ ... }}
        
        pattern = re.compile(r'style={(\s*[a-zA-Z]+:\s*[^}]+)}')
        
        def replacer(match):
            inner = match.group(1)
            return f"style={{{{{inner}}}}}"

        content = pattern.sub(replacer, content)

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
                if fix_style_syntax(os.path.join(root, file)):
                    print(f"Fixed Syntax on: {file}")
                    modified += 1
    print(f"Total fixed: {modified}")

if __name__ == "__main__":
    main()
