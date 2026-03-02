import os
import re

PAGES_DIR = "/home/ruanf/ZEPH/Z.CORE/src/pages"
COMPONENTS_DIR = "/home/ruanf/ZEPH/Z.CORE/src/components"

def refactor_tables(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Fiori Tables should ideally be flush with their container, but the ZCORE DataGrid
        # is already built as a card. If a page wraps a DataGrid in ANOTHER card, we fix that.
        # Find: <Card> or <div className="glass-card"> that ONLY contains a <DataGrid>
        
        # 1. Standardize page-level padding around the table.
        # Change any generic "padding: '24px'" on containers holding tables to var(--space-4)
        content = re.sub(
            r"padding:\s*['\"](?:24px|32px|2rem)['\"]",
            r"padding: 'var(--space-4)'",
            content
        )
        
        # 2. Fix the toolbar spacing above tables. 
        # Often there's a `<div style={{ display: 'flex', gap: '...` before a table.
        content = re.sub(
            r"(<div[^>]*style={{[^}]*display:\s*['\"]flex['\"].*?)(marginBottom:\s*['\"])(?:16px|20px|24px|1rem)(['\"])(.*?}}.*?>)",
            r"\1\2var(--space-4)\3\4",
            content
        )

        # 3. Ensure DataGrid height is constrained if it has a hardcoded pixel value that breaks rythm
        # Convert "height: '600px'" to "height: 'calc(100vh - 280px)'" or something similarly fluid.
        # Note: We won't auto-replace height unless it's strictly breaking, since some datagrids rely on flex: 1.

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
                if refactor_tables(os.path.join(root, file)):
                    print(f"Refactored Table Layout on: {file}")
                    modified += 1
    print(f"Total modified: {modified}")

if __name__ == "__main__":
    main()
