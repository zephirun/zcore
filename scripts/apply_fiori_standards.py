import os
import re

PAGES_DIR = "/home/ruanf/ZEPH/Z.CORE/src/pages"
COMPONENTS_DIR = "/home/ruanf/ZEPH/Z.CORE/src/components"

def refactor_jsx_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        changes_made = False

        # 1. Enforce strict PageContainer wrapping and Fiori Headers
        # Find ad-hoc headers (often flex, items-center, justify-between with an h1)
        # We will standardize the header container
        header_patterns = [
            (re.compile(r'<div\s+className=["\'](?:flex\s+)?justify-between\s+items-center\s+mb-[468]["\']\s*>'), 
             r'<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>'),
            (re.compile(r'<div\s+style={{[^}]*display:\s*["\']flex["\'][^}]*justifyContent:\s*["\']space-between["\'][^}]*marginBottom:\s*["\']\d+px["\'][^}]*}}\s*>'),
             r'<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>'),
             (re.compile(r'<div\s+className=["\']header-section["\'][^>]*>'), 
             r'<div className="fiori-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>')
        ]

        for pattern, replacement in header_patterns:
            if pattern.search(content):
                content = pattern.sub(replacement, content)
                changes_made = True

        # 2. Standardize KPI Sections / Dashboards (grid layout)
        kpi_patterns = [
            # Startup rounded corners / shadows on generic glass cards
            (re.compile(r'borderRadius:\s*["\'](?:16px|20px|1rem|1.5rem)["\']'), 
             r'borderRadius: "var(--radius)"'),
            (re.compile(r'boxShadow:\s*["\'][^"\']+["\'](?=\s*[,}\n].*?(?:card|glass))', re.IGNORECASE), 
             r'boxShadow: "var(--shadow-sm)"'),
            (re.compile(r'padding:\s*["\'](?:24px|32px|2rem)["\'](?=.*glass-card)'), 
             r'padding: "var(--density-card-padding)"'),
            
            # Grid gaps
            (re.compile(r'gap:\s*["\'](?:16px|20px|24px|1rem|1.5rem)["\']'), 
             r'gap: "var(--space-4)"'),
            (re.compile(r'gap-[4568]'), 
             r'gap-4'), # Assuming we still use some Tailwind but moving to CSS vars where inline
             
            # Hardcoded margins that break Fiori rhythm
            (re.compile(r'marginBottom:\s*["\'](?:16px|24px|32px|2rem)["\']'), 
             r'marginBottom: "var(--space-4)"'),
        ]

        for pattern, replacement in kpi_patterns:
            if pattern.search(content):
                content = pattern.sub(replacement, content)
                changes_made = True

        # 3. DataGrid Table Containers (flush with card)
        # If there's a DataGrid inside a glass-card, the glass card should ideally not have padding 
        # so the table header is flush.
        table_container_pattern = re.compile(r'<div[^>]*className=["\'][^"\']*glass-card[^"\']*["\'][^>]*style={{([^}]*)padding:[^,}]+(,[^}]*)?}}[^>]*>(?=\s*<DataGrid)')
        if table_container_pattern.search(content):
             # Remove padding from the card if it directly contains a DataGrid
             content = table_container_pattern.sub(r'<div className="glass-card" style={{\1\2, padding: 0, overflow: "hidden"}}>', content)
             changes_made = True

        # 4. Filter Bars / Toolbars (Standardize height and spacing)
        # Convert flex containers with too much generic padding
        filter_bar_pattern = re.compile(r'<div\s+className=["\']glass-card["\']\s+style={{([^}]*display:\s*["\']flex["\'][^}]*)padding:\s*["\'][^"\']+["\']([^}]*)}}')
        if filter_bar_pattern.search(content):
             content = filter_bar_pattern.sub(r'<div className="glass-card" style={{\1padding: "var(--space-3) var(--space-4)"\2}}', content)
             changes_made = True

        # 5. Form Layouts
        # Limit max width of form containers for readability
        form_container_pattern = re.compile(r'<form\s+style={{((?:(?!maxWidth)[^}])+)}}\s*>')
        if form_container_pattern.search(content):
             content = form_container_pattern.sub(r'<form style={{\1, maxWidth: "800px", margin: "0 auto"}}>', content)
             changes_made = True

        if changes_made and content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    modified_count = 0
    directories_to_scan = [PAGES_DIR, COMPONENTS_DIR]
    
    for directory in directories_to_scan:
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith('.jsx'):
                    filepath = os.path.join(root, file)
                    if refactor_jsx_file(filepath):
                        modified_count += 1
                        print(f"Refactored: {filepath}")

    print(f"\n=====================================")
    print(f"  SAP FIORI 3 REFACTORING COMPLETE   ")
    print(f"=====================================")
    print(f"Total files modified: {modified_count}")

if __name__ == "__main__":
    main()
