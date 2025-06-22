import { test as base, Page } from '@playwright/test';

export const test = base.extend<{
    page: Page;
}>({
    page: async ({ page }, use) => {
        await page.goto('http://localhost:5173');
        await use(page);
    },
});
