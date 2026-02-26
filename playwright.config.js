import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests/visual',
    /* Maximum time one test can run for. */
    timeout: 30 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         */
        timeout: 5000,
        toHaveScreenshot: {
            // An acceptable amount of pixels that could be different, value by default is 0.
            maxDiffPixels: 0,
            // An acceptable ratio of pixels that could be different, value by default is 0.2.
            maxDiffPixelRatio: 0.01,
            // Font rendering can differ between OSes, so we allow slightly higher thresholds in CI sometimes,
            // but for VRT we want strictness. Animations should be disabled.
            animations: 'disabled',
        },
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:6006',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',

        /* Disable animations for deterministic visual tests */
        contextOptions: {
            reducedMotion: 'reduce',
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // We can add Firefox/WebKit if needed, but for visual regressions Chromium is usually sufficient
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run storybook:serve',
        url: 'http://localhost:6006',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
