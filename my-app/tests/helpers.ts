import { Page } from '@playwright/test'

export type Offset = { dx: number; dy: number }
export type Point = { x: number; y: number }

export const OFFSETS: Offset[] = [
    { dx: -100, dy: -50 },
    { dx: 100, dy: -50 },
    { dx: 100, dy: 50 },
]

export async function getMapCenter(page: Page): Promise<Point> {
    const box = await page.locator('.leaflet-container').boundingBox()
    if (!box) throw new Error('Map container not found')
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

export async function drawPolygon(page: Page) {
    await page.locator('.control-icon.leaflet-pm-icon-polygon').locator('xpath=..').click()
    await page.locator('#draw-on-map-button').click()
    const center = await getMapCenter(page)
    for (const { dx, dy } of OFFSETS) {
        await page.locator('.leaflet-container').click({ position: { x: center.x + dx, y: center.y + dy } })
    }
    const { dx, dy } = OFFSETS[0]
    await page.locator('.leaflet-container').click({ position: { x: center.x + dx, y: center.y + dy } })
}
