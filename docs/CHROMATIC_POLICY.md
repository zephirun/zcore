# Chromatic Baseline Management Policy

This document outlines the official ZCORE policy for Visual Regression Testing using Chromatic.
Chromatic is our source of truth for UI confidence. Every PR automatically captures and compares visual snapshots against the baseline form the target branch.

---

## 📸 Matrix Coverage
Storybook is configured to test the ZCORE design system across a "Visual Matrix" via **Chromatic Modes**. For each component story, Chromatic will seamlessly capture snapshots in:

- **Theme**: Light Mode / Dark Mode
- **Density**: Compact / Default / Comfortable

CSS animations and transitions are globally disabled during capture in `.storybook/preview.js` to prevent flakiness.

---

## 🔍 PR Visual Review Flow

1. **Trigger**: When you open a PR, the `.github/workflows/chromatic.yml` Github Action runs.
2. **TurboSnap**: Chromatic leverages TurboSnap (`onlyChanged: true`) to trace your git changes and only screenshot stories that were affected. This keeps our CI fast and costs low.
3. **Capture & Compare**: Chromatic takes screenshots of your components and compares them pixel-by-pixel against the baseline on `main`.
4. **GitHub Status Checks**:
   - If there are **no changes**, the UI Check turns green.
   - If there **are changes**, the UI Check turns yellow (Pending).
5. **Review**: Click the "Details" link on the yellow check. It will take you to the Chromatic Web UI.
   - You will see the **Before** image, **After** image, and the **Highlighted Diff**.
   - If the changes are **intentional**, click **Accept**.
   - If they are **accidental regressions**, you must fix the code, push to the PR, and Chromatic will run again.

---

## 🛡️ Acceptance & Approval Policy

- **Who Approves**: The developer who opened the PR is responsible for reviewing and accepting visual changes on Chromatic, unless the PR touches Core Components (e.g. `Button`, `DataGrid`).
- **Core Component Review**: If your PR modifies a base Foundation/UI component that ripples across many data screens, you must explicitly flag a Design System Core Member to review the Chromatic build.
- **Accidental Approvals**: If an incorrect UI visual change is accepted on a PR and merged into `main`, it becomes the *new baseline*. To fix it, you must open a new PR containing the fix to effectively *overwrite* the baseline.

---

## 🛑 Writing Deterministic Stories (Hardening)

Visual tests must remain completely deterministic. When writing new ZCORE stories, adhere strictly to these rules:

- **No random data**: Do not use `Math.random()`, `faker.js`, or randomized array shuffling.
- **No dynamic timestamps**: Do not use `new Date()` or `Date.now()`. Pass hardcoded, mocked static dates (`new Date('2026-02-21T00:00:00Z')`).
- **Consistent Wrapper**: Ensure all stories leverage the standard design system container wrappers, so padding/margins remain robust.
- **Await Fonts**: We already preload static web fonts locally, but ensure any external remote assets (like generic profile pictures for dummy avatars) use stable, high-availability image mocking links.

---

## 🔑 Setup & Local Usage

Chromatic is fully integrated in GitHub actions. But if you wish to run it locally to initialize a baseline or fast-forward tests, use:

```bash
# Requires setting your CHROMATIC_PROJECT_TOKEN as an environment variable
npm run chromatic --project-token=$CHROMATIC_PROJECT_TOKEN
```
