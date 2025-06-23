import { expect } from "playwright/test"
import { test } from "./fixtures"

test.describe('Map Layer Control Panel', () => {
  const LAYER_NAME = 'Test Layer'
  const LAYER_URL = 'https://tiles.test.com/{z}/{x}/{y}.png'
  const LAYER_ID = "test-layer"

  test('adds and activates a new map layer', async ({ page }) => {
    await page.locator('#open-map-layer-dialog-button').click()
    await page.locator('#map-layer-name').fill(LAYER_NAME)
    await page.locator('#map-layer-url').fill(LAYER_URL)
    await page.locator('#add-layer-button').click()

    const newLayerBtn = page.getByRole('button', { name: LAYER_NAME })
    await expect(newLayerBtn).toBeVisible()
    await expect(newLayerBtn).toBeEnabled()

    await newLayerBtn.click()

    await expect(newLayerBtn).toBeDisabled()

    const tileContainer = page.locator(`#${LAYER_ID}`)
    await expect(tileContainer).toBeVisible()
  })
})


test.describe('Waypoint Marker Control', () => {
  test('adds a waypoint marker to the map', async ({ page }) => {
    await page.locator('#add-waypoint-button').click()

    const waypoint = page.locator('[data-testid="location-marker-waypoint-1"]')
    await expect(waypoint).toBeVisible()
  })
})
