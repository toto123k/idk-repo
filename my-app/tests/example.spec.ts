import { expect } from "playwright/test"
import { test } from "./fixtures"

test.describe('Map Layer Control Panel', () => {
  const LAYER_NAME = 'Test Layer'
  const LAYER_URL = 'https://tiles.test.com/{z}/{x}/{y}.png'
  const LAYER_ID = "test-layer"

  test('adds and activates a new map layer', async ({ page }) => {
    // Open the add layer modal
    await page.locator('#open-map-layer-dialog-button').click()

    // Fill in modal fields
    await page.locator('#map-layer-name').fill(LAYER_NAME)
    await page.locator('#map-layer-url').fill(LAYER_URL)

    // Submit the form
    await page.locator('#add-layer-button').click()

    // Ensure the new button appears and is enabled
    const newLayerBtn = page.getByRole('button', { name: LAYER_NAME })
    await expect(newLayerBtn).toBeVisible()
    await expect(newLayerBtn).toBeEnabled()

    // Click to activate the new layer
    await newLayerBtn.click()

    // Ensure it is now disabled (indicating selection)
    await expect(newLayerBtn).toBeDisabled()

    // Wait for the leaflet layer container to appear with the given ID
    const tileContainer = page.locator(`#${LAYER_ID}`)
    await expect(tileContainer).toBeVisible()
  })
})


test.describe('Waypoint Marker Control', () => {
  test('adds a waypoint marker to the map', async ({ page }) => {
    // Click the add waypoint button
    await page.locator('#add-waypoint-button').click()

    // Wait for the waypoint marker to appear in the leaflet marker pane
    const waypoint = page.locator('[data-testid="location-marker-waypoint-1"]')
    await expect(waypoint).toBeVisible()
  })
})
