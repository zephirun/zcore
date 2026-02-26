import { test, expect } from '@playwright/test';
import { gotoStory } from '../utils/storybook.js';

const densities = ['compact', 'comfortable'];
const themes = ['light', 'dark'];

test.describe('DataTable Visual Regressions', () => {
    for (const theme of themes) {
        for (const density of densities) {
            test(`DataTable Default - ${theme} - ${density}`, async ({ page }) => {
                // You would replace this ID with the actual Storybook ID for your DataTable component
                await gotoStory(page, 'data-components-datagrid--massive-virtualization', { theme, density });

                const rootElement = page.locator('#storybook-root');
                await expect(rootElement).toBeVisible();

                await expect(rootElement).toHaveScreenshot(`DataTable-default-${theme}-${density}.png`);
            });

            test(`DataTable Loading State - ${theme} - ${density}`, async ({ page }) => {
                await gotoStory(page, 'data-components-datagrid--loading-state', { theme, density });

                const rootElement = page.locator('#storybook-root');
                await expect(rootElement).toBeVisible();

                await expect(rootElement).toHaveScreenshot(`DataTable-loading-${theme}-${density}.png`);
            });

            test(`DataTable Empty State - ${theme} - ${density}`, async ({ page }) => {
                await gotoStory(page, 'data-components-datagrid--empty-state', { theme, density });

                const rootElement = page.locator('#storybook-root');
                await expect(rootElement).toBeVisible();

                await expect(rootElement).toHaveScreenshot(`DataTable-empty-${theme}-${density}.png`);
            });
        }
    }
});
