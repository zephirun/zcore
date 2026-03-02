import os
import re

PAGES_DIR = "/home/ruanf/ZEPH/Z.CORE/src/pages"
COMPONENTS_DIR = "/home/ruanf/ZEPH/Z.CORE/src/components"

def refactor_states(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Standardizing Empty States styling inside pages in case they aren't using the EmptyState component
        # Look for ad-hoc "nenhum dado" or empty states that use generic flex, items-center, justify-center 
        # with high py- values or padding
        
        # 1. Dashboard empty states usually show up as full height generic cards.
        # Find flex-col, items-center, justify-center inside a card with padding.
        # Enforce dashed border and var(--bg-card) for empty states instead of a solid shadow card if possible, 
        # or at least normalize their padding and gap to Fiori rythm.
        
        # Adjusting the padding of empty and loading containers to Fiori space-12
        content = re.sub(
            r"(padding:\s*['\"])(?:40px|48px|3rem|2rem)(['\"])",
            r"\1var(--space-12)\2",
            content
        )

        content = re.sub(
            r"(padding:\s*['\"])(?:64px|4rem)(['\"])",
            r"\1var(--space-16)\2",
            content
        )

        # 2. Loading state Spinners -> Often they have minHeight of "60vh" or "400px". Fiori recommends flex-grow for these.
        content = re.sub(
            r"(minHeight:\s*['\"])(?:400px|60vh)(['\"])",
            r"\1 300px\2", # Setting a standard min height instead of excessive ones
            content
        )

        # 3. Typography drift in empty states.
        # Often empty states have h3 with arbitrary sizes.
        content = re.sub(
            r"(fontSize:\s*['\"])(?:24px|1\.5rem|2rem)(['\"])(?=[^}]*?nenhum|vazio)",
            r"\1var(--text-xl)\2",
            flags=re.IGNORECASE,
            string=content
        )

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
    directories = [PAGES_DIR, COMPONENTS_DIR]
    for directory in directories:
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith('.jsx'):
                    if refactor_states(os.path.join(root, file)):
                        print(f"Refactored States Layout on: {file}")
                        modified += 1
    print(f"Total modified: {modified}")

if __name__ == "__main__":
    main()
