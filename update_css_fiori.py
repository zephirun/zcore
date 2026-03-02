import re

with open('src/index.css', 'r') as f:
    css = f.read()

# Replace variables block
var_block_start = css.find(':root {')
var_block_end = css.find('}', css.find('[data-theme=\'dark\']')) + 1

new_vars = """:root {
    /* === SAP FIORI 3 ENTERPRISE DESIGN SYSTEM === */
    /* Preserving ZCORE branding (dark/monochrome base) but strictly Fiori structure */

    /* Semantic colors */
    --color-success: #107e3e; /* Fiori Positive */
    --color-error: #bb0000;   /* Fiori Negative */
    --color-warning: #e9730c; /* Fiori Critical */
    --color-info: #0a6ed1;    /* Fiori Information */
    --color-purple: #8146ac;

    /* Light Mode — Fiori Quartz Light structural colors */
    --color-primary: #111111; /* ZCORE Brand */
    --color-primary-dim: rgba(0, 0, 0, 0.06);
    --color-accent: #0a6ed1;  /* Fiori Active/Action color */

    --bg-main: #f3f4f5;       /* Fiori Layer 0 */
    --bg-card: #ffffff;       /* Fiori Layer 1 */
    --bg-elevated: #ffffff;   /* Fiori Layer 2 */
    --bg-input: #ffffff;
    --bg-hover: #ebebeb;      /* Fiori List Item Hover */
    --bg-selected: #e5f0fa;   /* Fiori Selected */

    --text-main: #32363a;     /* Fiori Base Text */
    --text-muted: #6a6d70;    /* Fiori Muted Text */
    --text-light: #ffffff;

    --border-color: #d9d9d9;  /* Fiori Standard Border */
    --border-input: #89919a;  /* Fiori Input Border */
    --border-subtle: #e4e4e4;

    --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.15);
    --shadow-md: 0 2px 4px 0 rgba(0,0,0,0.15);
    --shadow-lg: 0 4px 8px 0 rgba(0,0,0,0.15);
    --shadow-xl: 0 10px 20px 0 rgba(0,0,0,0.15);

    --font-main: '72', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

    /* Typography Scale (Fiori Enterprise Base: 14px) */
    --text-xs: 11px;
    --text-sm: 12px;
    --text-base: 14px;
    --text-lg: 16px;
    --text-xl: 18px;
    --text-2xl: 20px;
    --text-3xl: 24px;
    --text-4xl: 28px;

    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;
    --font-extrabold: 800;

    /* Spacing Scale (Base 4 - Fiori Standard) */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-8: 32px;
    --space-10: 40px;
    --space-12: 48px;
    --space-16: 64px;

    /* Fiori Layout Variables */
    --header-height: 44px; /* Fiori Shell Bar Height */
    --sidebar-width: 240px; /* Fiori Tool Page / Side Navigation */
    --sidebar-collapsed-width: 48px;

    /* Enterprise Radius (Strictly professional, no consumer bubbles) */
    --radius-sm: 2px;
    --radius: 4px;      /* Default Fiori Control Radius */
    --radius-lg: 6px;
    --radius-xl: 8px;   /* Dialog/Card Radius max */
    --radius-full: 9999px;

    /* Fiori Motion System (Snappy, direct, not bouncy) */
    --transition-fast: 100ms ease;
    --transition-base: 150ms ease;
    --motion-fast: 100ms;
    --motion-base: 150ms;
    --motion-slow: 200ms;
    --ease-standard: ease;
    --ease-emphasized: ease;
    --ease-decelerate: ease-out;
    --ease-accelerate: ease-in;

    --ring-color: rgba(10, 110, 209, 0.5); /* Fiori Focus Ring */
    --ring-offset-color: var(--bg-main);

    /* Compact Mode (ERP Data Density) */
    --compact-space-1: 1px;
    --compact-space-2: 2px;
    --compact-space-3: 4px;
    --compact-space-4: 8px;
    --compact-space-5: 12px;

    /* Legacy compat */
    --glass-bg: var(--bg-card);
    --glass-border: 1px solid var(--border-color);
    --glass-shadow: none;
    --glass-blur: blur(0px);
    --bg-obsidian: var(--bg-card);
    --color-primary-glow: transparent;
}

/* === DENSITY TOKENS (Fiori Cozy vs Compact) === */
:root,
[data-density="default"] {
    --density-scale: 1;
    --density-padding-xs: 4px;
    --density-padding-sm: 8px;
    --density-padding-md: 16px;
    --density-row-height: 44px; /* Cozy table row */
    --density-input-height: 36px; /* Cozy input height */
    --density-table-cell-padding: 8px 16px;
    --density-card-padding: 16px;
}

[data-density="comfortable"] {
    --density-scale: 1.15;
    --density-padding-xs: 8px;
    --density-padding-sm: 16px;
    --density-padding-md: 24px;
    --density-row-height: 48px;
    --density-input-height: 44px;
    --density-table-cell-padding: 12px 16px;
    --density-card-padding: 24px;
}

[data-density="compact"] {
    --density-scale: 0.85;
    --density-padding-xs: 2px;
    --density-padding-sm: 4px;
    --density-padding-md: 8px;
    --density-row-height: 32px; /* Compact table row */
    --density-input-height: 26px; /* Compact input height */
    --density-table-cell-padding: 4px 8px;
    --density-card-padding: 12px;
}

[data-theme='dark'] {
    /* Fiori 3 Quartz Dark */
    --bg-main: #1c2228;
    --bg-card: #232a31;
    --bg-elevated: #293139;
    --bg-input: #1c2228;
    --bg-hover: rgba(255, 255, 255, 0.08);
    --bg-selected: rgba(10, 110, 209, 0.2);

    --text-main: #fafafa;
    --text-muted: #89919a;
    --text-light: #ffffff;

    --border-color: #3f474d;
    --border-input: #515c65;
    --border-subtle: #293139;

    --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.4);
    --shadow-md: 0 2px 4px 0 rgba(0,0,0,0.4);
    --shadow-lg: 0 4px 8px 0 rgba(0,0,0,0.4);
    --shadow-xl: 0 10px 20px 0 rgba(0,0,0,0.5);

    /* Legacy compat */
    --glass-bg: var(--bg-card);
    --glass-border: 1px solid var(--border-color);
    --glass-shadow: none;
    --glass-blur: blur(0px);
    --bg-obsidian: var(--bg-card);
    --color-primary-glow: transparent;
    --color-primary: #fafafa;
    --color-accent: #0a6ed1;
}"""

css = css[:var_block_start] + new_vars + css[var_block_end:]

# Replace body styles
css = re.sub(r'body \{[^}]*\}', '''body {
    margin: 0;
    padding: 0;
    font-family: var(--font-main);
    background: var(--bg-main);
    color: var(--text-main);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    transition: background-color var(--transition-base), color var(--transition-base);
    font-size: var(--text-base); /* Fiori 14px */
    line-height: 1.4;
}''', css)

# Fix component polish block
css = css.replace('.ui-button:active:not(:disabled) {\n    transform: scale(0.97);\n}', 
                  '.ui-button:active:not(:disabled) {\n    background-color: var(--bg-active) !important;\n}')

with open('src/index.css', 'w') as f:
    f.write(css)
