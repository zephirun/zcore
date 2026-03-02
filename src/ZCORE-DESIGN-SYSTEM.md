# 🎨 Official ZCORE Design System

This document outlines the official design tokens established for the ZCORE interface. All React components and application views **must** use these CSS variables to ensure strict visual consistency, dark-mode compatibility, and responsive density.

**Do not use hardcoded pixel values or hex colors.**

---

## 🎨 1. Color System (Semantic & Structural)

ZCORE relies on a robust structural layering system inspired by SAP Fiori 3, wrapped in our bespoke aesthetic.

### Semantic Colors (Status & Feedback)
Use these for alerts, badges, tags, and validations.
*   `var(--color-success)`: Positive actions, successful states (`#107e3e`)
*   `var(--color-error)`: Destructive actions, errors, high risk (`#bb0000`)
*   `var(--color-warning)`: Warnings, medium risk, pending (`#e9730c`)
*   `var(--color-info)`: Informational feedback, neutral highlights (`#0a6ed1`)
*   `var(--color-purple)`: AI insights, special branding (`#8146ac`)

### Structural Backgrounds (Elevation Layers)
Always respect the layering hierarchy to ensure proper contrast in Dark Mode.
*   `var(--bg-main)`: **Layer 0** - The absolute base background of the application (Body, Canvas).
*   `var(--bg-card)`: **Layer 1** - Standard containers (Cards, Sidebars, Topbars).
*   `var(--bg-elevated)`: **Layer 2** - Floating elements (Modals, Dropdowns, Toasts, Tooltips).
*   `var(--bg-input)`: Background specifically for Form Inputs.
*   `var(--bg-hover)`: Background color for interactive rows/items on hover.
*   `var(--bg-selected)`: Background color for active/selected items.

### Typography Colors
*   `var(--text-main)`: Primary readable text (Headings, Paragraphs, Values).
*   `var(--text-muted)`: Secondary text (Subtitles, Labels, Hints).
*   `var(--text-light)`: Text forced to remain white (e.g. inside a solid dark button).

### Borders & Focus
*   `var(--border-color)`: Standard structural borders (Cards, Dividers).
*   `var(--border-input)`: Borders specifically for Form Inputs.
*   `var(--border-subtle)`: Very faint borders for internal card structures.
*   `var(--ring-color)`: The global accessibility focus ring color.

---

## 📏 2. Spacing Scale (Base 4)

Never use arbitrary padding/margin like `15px` or `23px`. Stick strictly to the standard tokenized scale:

*   `var(--space-1)`: 4px
*   `var(--space-2)`: 8px
*   `var(--space-3)`: 12px
*   `var(--space-4)`: 16px (Default Card Padding Base)
*   `var(--space-5)`: 20px
*   `var(--space-6)`: 24px
*   `var(--space-8)`: 32px (Section gaps)
*   `var(--space-10)`: 40px
*   `var(--space-12)`: 48px
*   `var(--space-16)`: 64px

---

## 🔠 3. Typography Scale

ZCORE uses Inter/72 as the primary font family (`var(--font-main)`). 
Base size is `14px` (`var(--text-base)`).

*   `var(--text-xs)`: 11px (Micro copy, tags)
*   `var(--text-sm)`: 12px (Hints, secondary labels)
*   `var(--text-base)`: 14px (Standard reading text)
*   `var(--text-lg)`: 16px (Subheadings, primary labels)
*   `var(--text-xl)`: 18px (H4)
*   `var(--text-2xl)`: 20px (H3)
*   `var(--text-3xl)`: 24px (H2)
*   `var(--text-4xl)`: 28px (H1 - Major Page Titles)

### Font Weights
*   `var(--font-normal)`: 400
*   `var(--font-medium)`: 500
*   `var(--font-semibold)`: 600
*   `var(--font-bold)`: 700
*   `var(--font-extrabold)`: 800

---

## 📐 4. Border Radius (Corners)

ZCORE aims for a professional, enterprise appearance. We do not use fully rounded "pill" buttons everywhere.

*   `var(--radius-sm)`: 2px (Inner elements, small tags)
*   `var(--radius)`: 4px (Standard Inputs, Buttons)
*   `var(--radius-lg)`: 6px
*   `var(--radius-xl)`: 8px (Cards, Modals)
*   `var(--radius-full)`: 9999px (Avatars only)

---

## 🌑 5. Elevation (Shadows)

Apply shadows to lift elements off the page. Shadows automatically invert/darken in Dark Mode.

*   `var(--shadow-sm)`: Small interactive elements (Buttons)
*   `var(--shadow-md)`: Standard floating elements (Dropdown menus)
*   `var(--shadow-lg)`: Prominent structural elements (Modals, Toasts)
*   `var(--shadow-xl)`: Maximum elevation (Drawers, major overlays)

---

## 🎬 6. Motion (Transitions)

ZCORE uses a snappy, direct motion system. Avoid bouncy or overtly slow animations.

*   `var(--transition-fast)` / `var(--motion-fast)`: 100ms (Hover states, button active states)
*   `var(--transition-base)` / `var(--motion-base)`: 150ms (Dropdown reveals, color theme switching)
*   `var(--motion-slow)`: 200ms (Large modal reveals)

---

## ⚙️ How to Apply

**❌ BAD (Hardcoded):**
```css
.my-card {
    background: #ffffff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    color: #333;
    font-size: 14px;
    transition: all 0.2s ease;
}
```

**✅ GOOD (Tokenized):**
```css
.my-card {
    background: var(--bg-card);
    padding: var(--space-6);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    color: var(--text-main);
    font-size: var(--text-base);
    transition: all var(--transition-base);
}
```
