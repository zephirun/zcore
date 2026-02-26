/**
 * Navigates to a specific story in the Storybook iframe deterministically.
 * 
 * @param {import('@playwright/test').Page} page
 * @param {string} storyId - The Storybook ID (e.g. 'components-button--primary')
 * @param {object} options
 * @param {'light' | 'dark'} [options.theme='light'] - Theme to render the component in
 * @param {'compact' | 'comfortable'} [options.density='comfortable'] - Density mode
 */
export async function gotoStory(page, storyId, { theme = 'light', density = 'comfortable' } = {}) {
    const params = new URLSearchParams();
    params.set('id', storyId);
    params.set('viewMode', 'story');

    // Passing globals for storybook toolbar toggles
    const globals = [];
    if (theme) globals.push(`theme:${theme}`);
    if (density) globals.push(`density:${density}`);
    if (globals.length > 0) {
        params.set('globals', globals.join(';'));
    }

    const url = `/iframe.html?${params.toString()}`;

    // Wait for network idle to ensure images/fonts are loaded.
    await page.goto(url, { waitUntil: 'networkidle' });

    // Ensure fonts are fully loaded before capturing screenshot
    await page.evaluate(async () => {
        await document.fonts.ready;
    });

    // Inject CSS to disable animations, transitions, and blinking cursors
    await page.addStyleTag({
        content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
      /* Optional: hide scrollbars for cleaner diffs */
      ::-webkit-scrollbar {
        display: none !important;
      }
      body {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
    `
    });

    // Short delay to allow any React useEffects to settle if they don't depend on network
    await page.waitForTimeout(100);
}
