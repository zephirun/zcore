import os
import re

PAGES_DIR = "/home/ruanf/ZEPH/Z.CORE/src/pages"

def robust_refactor(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 1. Grid Gaps
        # Find style={{ ... gap: 'something' ... }} and replace with var(--space-4)
        content = re.sub(
            r"(style={{[^}]*?gap:\s*['\"])([^'\"]+)(['\"][^}]*}})",
            r"\1var(--space-4)\3",
            content
        )
        # Find className="... gap-X ..." and replace with gap-4
        content = re.sub(
            r"(className=[\"'][^\"']*?)gap-[0-9]+([^\"']*?[\"'])",
            r"\1gap-4\2",
            content
        )

        # 2. Bottom Margins
        content = re.sub(
            r"(style={{[^}]*?marginBottom:\s*['\"])([^'\"]+)(['\"][^}]*}})",
            r"\1var(--space-4)\3",
            content
        )

        # 3. Card Padding (In StrategicDashboard, it's inside StrategicCard -> Card)
        # We need to ensure Cards don't have hardcoded big paddings. ZCORE's Card component might have default padding.
        # But if there are explicit paddings we change them.
        content = re.sub(
            r"(style={{[^}]*?padding:\s*['\"])(?:24px|32px|2rem)(['\"][^}]*}})",
            r"\1var(--density-card-padding)\2",
            content
        )

        # 4. Border Radius and Shadows on generic glass cards
        content = re.sub(
            r"(borderRadius:\s*['\"])(?:16px|20px|1rem|1\.5rem)(['\"])",
            r"\1var(--radius)\2",
            content
        )
        
        # 5. Fix card header margins (StrategicCard uses marginBottom: 'var(--space-6)', change to 4)
        content = re.sub(
            r"(title=.*?marginBottom:\s*['\"])var\(--space-6\)(['\"])",
            r"\1var(--space-4)\2",
            content
        )

        # 6. typography drift (e.g. tracking-tight or arbitrary huge fonts)
        # Not strictly necessary if it uses var(--text-4xl) which is fine for KPIs, but let's ensure Fiori weights
        content = re.sub(
            r"(fontWeight:\s*['\"])(?:900|700)(['\"])",
            r"\1var(--font-bold)\2",  # Fiori max bold is usually 700
            content
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
    for root, dirs, files in os.walk(PAGES_DIR):
        for file in files:
            if file.endswith('.jsx'):
                if robust_refactor(os.path.join(root, file)):
                    print(f"Refactored: {file}")
                    modified += 1
    print(f"Total modified: {modified}")

if __name__ == "__main__":
    main()
