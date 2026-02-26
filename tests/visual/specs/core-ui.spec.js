import { test, expect } from '@playwright/test';
import { gotoStory } from '../utils/storybook.js';

// Define the components and their story IDs to test
const components = [
    { name: 'Button', id: 'ui-base-button--primary' },
    { name: 'Button (Secondary)', id: 'ui-base-button--secondary' },
    { name: 'Input', id: 'ui-base-input--default' },
    { name: 'Select', id: 'ui-base-select--default' },
    { name: 'Skeleton', id: 'data-components-skeleton--default-rectangular' },
    { name: 'Sidebar', id: 'layout-sidebar--default' },
];

const themes = ['light', 'dark'];

test.describe('Core UI Visual Regressions', () => {
    for (const component of components) {
        test.describe(component.name, () => {
            for (const theme of themes) {
                test(`should match baseline in ${theme} mode`, async ({ page }) => {
                    await gotoStory(page, component.id, { theme });

                    // Take a screenshot of the root element to avoid capturing empty space
                    const rootElement = page.locator('#storybook-root');
                    await expect(rootElement).toBeVisible();

                    // Assert screenshot matches baseline
                    await expect(rootElement).toHaveScreenshot(`${component.name}-${theme}.png`);
                });
            }
        });
    }
});
