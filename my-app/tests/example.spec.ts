import { expect } from "playwright/test"
import { test } from "./fixtures"
import { getMapCenter, OFFSETS } from "./helpers"

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

  test('adds a waypoint and shows its UTM popup', async ({ page }) => {
    await page.locator('#add-waypoint-button').click()

    const waypointMarker = page.locator('[data-testid="location-marker-waypoint-1"]')
    await waypointMarker.waitFor()

    await waypointMarker.click()

    const utmPopup = page.locator('.location-popup-utm')
    await utmPopup.waitFor()

    expect(await utmPopup.isVisible()).toBeTruthy()
  })
})

test.describe('Polygon Creation', () => {
  test('Polygon Draw Control - draw by coords', async ({ page }) => {
    const polygonButton = page.locator('.control-icon.leaflet-pm-icon-polygon').locator('xpath=..')
    await expect(polygonButton).toBeVisible()
    await polygonButton.click()

    const enterCoordinatesButton = page.locator('#enter-coordinates-button')
    await expect(enterCoordinatesButton).toBeVisible()
    await enterCoordinatesButton.click()
    await expect(page.getByText('Define Polygon by Coordinates')).toBeVisible()

    await page.fill('#coordinate-lat-0', '90')
    await page.fill('#coordinate-lng-0', '-180')
    await page.fill('#coordinate-lat-1', '90')
    await page.fill('#coordinate-lng-1', '180')
    await page.fill('#coordinate-lat-2', '-90')
    await page.fill('#coordinate-lng-2', '180')

    await page.click('#add-coordinate-button')
    await page.fill('#coordinate-lat-3', '-90')
    await page.fill('#coordinate-lng-3', '-180')

    const createBtn = page.locator('#coordinates-create-button')
    await expect(createBtn).toBeEnabled()
    await createBtn.click()
    await expect(page.getByText('Define Polygon by Coordinates')).toBeHidden()

    const polygonElement = page.locator('[data-test-id="poly-0"]')
    await expect(polygonElement).toBeVisible()
  })


  test('Polygon Draw Control – draw on map', async ({ polygonPage }) => {
    const polygon = polygonPage.locator('[data-test-id="poly-0"]')
    await expect(polygon).toBeVisible()
  })
})


test.describe('Polygon Editing', () => {
  test('moves first vertex and verifies bounding box shifts right', async ({ polygonPage }) => {
    const center = await getMapCenter(polygonPage)
    const startPos = { x: center.x + OFFSETS[0].dx, y: center.y + OFFSETS[0].dy }
    const editButton = await polygonPage.locator('.control-icon.leaflet-pm-icon-edit').locator('xpath=..');

    await editButton.click()

    const polygonLocator = polygonPage.locator('[data-test-id="poly-0"]')
    const initialBox = await polygonLocator.boundingBox()
    if (!initialBox) throw new Error('Polygon not rendered')

    await polygonPage.mouse.move(startPos.x, startPos.y)
    await polygonPage.mouse.down()
    await polygonPage.mouse.move(startPos.x + 20, startPos.y)
    await polygonPage.mouse.up()

    await editButton.click()

    const movedBox = await polygonLocator.boundingBox()
    if (!movedBox) throw new Error('Polygon disappeared after drag')

    expect(movedBox.x).toBeGreaterThan(initialBox.x)
  })

  test('drags entire polygon and verifies bounding box shifts', async ({ polygonPage }) => {
    const polygon = polygonPage.locator('[data-test-id="poly-0"]')
    const initialBox = await polygon.boundingBox()
    if (!initialBox) throw new Error('Polygon not rendered')
    const dragButton = await polygonPage.locator('.control-icon.leaflet-pm-icon-drag')
      .locator('xpath=..');

    await dragButton.click()

    const startX = initialBox.x + initialBox.width / 2
    const startY = initialBox.y + initialBox.height / 2

    const dragOffset = { dx: 30, dy: -15 }
    await polygonPage.mouse.move(startX, startY)
    await polygonPage.mouse.down()
    await polygonPage.mouse.move(startX + dragOffset.dx, startY + dragOffset.dy)
    await polygonPage.mouse.up()

    await dragButton.click()

    const movedBox = await polygon.boundingBox()
    if (!movedBox) throw new Error('Polygon disappeared after drag')

    expect(movedBox.x).toBeGreaterThan(initialBox.x)
    expect(movedBox.y).toBeLessThan(initialBox.y)
  })
})



test.describe('Route Fetching', () => {
  test('fetches a route and renders the polyline', async ({ page }) => {
    await page.click('#fetch-route-button')
    const polyline = page.locator('.route-polyline')
    await polyline.waitFor()
    expect(await polyline.count()).toBeGreaterThan(0)
  })
})