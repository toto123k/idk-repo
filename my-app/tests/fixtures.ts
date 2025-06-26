import { test as base, Page } from '@playwright/test'
import { drawPolygon } from './helpers'

export const test = base.extend<{ polygonPage: Page }>({
    page: async ({ page }, use) => {
        await page.goto('http://localhost:5173')
        await use(page)
    },
    polygonPage: async ({ page }, use) => {
        await page.goto('http://localhost:5173')
        await drawPolygon(page)
        await page.locator('[data-test-id="poly-0"]').waitFor()
        await use(page)
    },
})

export { expect } from '@playwright/test'
