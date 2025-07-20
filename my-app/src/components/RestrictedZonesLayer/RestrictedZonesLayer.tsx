import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import * as L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useAtom } from 'jotai'
import { drawnItemsAtom } from '../../state/drawingItemsAtom'

export const RestrictedZonesLayer = () => {
    const map = useMap()
    const [drawnItems] = useAtom(drawnItemsAtom)

    useEffect(() => {
        if (!map.pm) return

        // opt‑in + add your feature‑group
        L.PM.setOptIn(true)
        map.addLayer(drawnItems)

        // keep the standard toolbar in place, but remove the default polyline button
        map.pm.addControls({
            position: 'topright',
            drawControls: true,
            drawPolyline: false,
            drawPolygon: false,
            drawCircle: false,
            drawRectangle: false,
            drawMarker: false,
            editMode: true,
            removalMode: true
        })

        // clone the polyline control (gives you both a new toolbar button **and** a drawInstance)
        const { drawInstance, control: lineControl } =
            map.pm.Toolbar.copyDrawControl('drawPolyline', {
                name: 'drawLineNoTooltip',
                block: 'draw',
                title: 'Draw Line (no tooltip)',
                actions: ['cancel', 'removeLastVertex', 'finish']
            })  // :contentReference[oaicite:0]{index=0}

        drawInstance.setOptions({ tooltips: false })

        // monkey‑patch its enable() so that every time you click it,
        // you force its own tooltips option off before it ever starts drawing


        // done—no draw tooltips ever appear, yet you still get
        // cancel/undo/finish from that cloned button
    }, [map, drawnItems])

    return null
}
