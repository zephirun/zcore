# Visual Regression Testing Maintenance Guide

This document outlines the strategy and maintenance procedures for the **ZCORE Visual Regression Testing System**.

## System Overview

Visual regressions are tested using Playwright. Playwright navigates to individual component stories within a statically built Storybook iframe. This isolation ensures components have no external dependencies influencing their visual state (e.g., inconsistent routing or global state).

The strategy captures screenshots across:
- **Themes**: Light and Dark mode.
- **Densities**: Compact, Comfortable, Spacious (for Data-heavy components like tables).

---

## Running Visual Tests Locally

### 1. Build Storybook First
Visual tests run against a static Storybook build for ultimate determinism. Before running tests locally, always ensure you have a fresh build:
```bash
npm run build-storybook
```

### 2. Run the Tests
```bash
npm run test:visual
```
*Note: Playwright will automatically serve the static storybook locally using your `webServer` config.*

---

## Baseline Strategy

Baselines are the golden standard images stored in the `tests/visual/specs/**/*-snapshots` directories. 
Playwright automatically creates baselines if they do not exist.

### Updating Baselines
When you intentionally modify a component's visuals, tests will fail. To update the baselines:

1. Build storybook:
   ```bash
   npm run build-storybook
   ```
2. Run the update command:
   ```bash
   npm run test:visual:update
   ```
3. **Review the diffs manually** using Git (e.g., using GitHub Desktop or VSCode's Source Control view) to ensure the updated images reflect the *intended* design changes and nothing else.
4. Commit the new snapshots.

### Avoiding Flakiness
To prevent flaky screenshots (where tests fail spuriously):
- **Animations disabled**: CSS animations, transitions, and blinking cursors are disabled automatically by the `gotoStory` helper.
- **Network Idle**: The helper waits for network requests and fonts to finish loading.
- **Mock Data**: Always use deterministic, mocked data in your Storybook stories. Do not use random generators for text, dates, or avatars in stories that are visually tested.

---

## Adding New Components

To add another component to the test suite:
1. Identify the component's Storybook ID (e.g., `components-tooltip--default`).
2. Add the component to the corresponding spec file (e.g., `tests/visual/specs/core-ui.spec.js`), or create a new spec file.
3. Run `npm run test:visual:update` to generate the initial baseline.

---

## Reviewing CI Failures

When semantic or visual checks fail in CI (GitHub Actions):
1. Navigate to the failing Workflow run.
2. Download the `playwright-report` or `visual-diffs` artifact.
3. Open `playwright-report/index.html` to view visual diffs. The report will display:
   - The **baseline** image.
   - The **current** (failing) image.
   - The **diff** highlighting the exact differing pixels.
4. Either fix the regression in your code, or run `npm run test:visual:update` locally if the change was deliberate.

---

## Troubleshooting

### Missing System Dependencies (Linux)
If Playwright fails to launch Chromium locally with an error like `error while loading shared libraries: libnspr4.so`, your machine is missing required browser dependencies.

Run the following command. Playwright will automatically prompt for your `sudo` password to install them:
```bash
npx playwright install-deps chromium
```

