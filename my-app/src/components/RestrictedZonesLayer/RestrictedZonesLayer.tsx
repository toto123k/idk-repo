// src/components/RestrictedZonesLayer.tsx
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import * as L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

// module-scope holder
let _drawnItems: L.FeatureGroup | null = null

/** call this from anywhere to get the latest GeoJSON */
export function getUpdatedZonesGeoJSON(): GeoJSON.FeatureCollection {
    if (!_drawnItems) {
        return { type: 'FeatureCollection', features: [] }
    }
    return _drawnItems.toGeoJSON() as GeoJSON.FeatureCollection
}

export const RestrictedZonesLayer = () => {
    const map = useMap()
    const drawnRef = useRef(new L.FeatureGroup())

    useEffect(() => {
        if (!map?.pm) return

        L.PM.setOptIn(true)
        const drawnItems = drawnRef.current.addTo(map)
        _drawnItems = drawnItems

        map.pm.addControls({
            position: 'topright',
            drawCircle: false,
            drawRectangle: false,
            drawPolygon: true,
            drawPolyline: false,
            drawMarker: false,
            drawCircleMarker: false,
            drawText: false,
            editMode: true,
            dragMode: true,
            cutPolygon: true,
            removalMode: true,
            rotateMode: true,
        })

        map.on('pm:create', (e: any) => {
            const layer = e.layer
            layer.options.pmIgnore = false // Opt In geoman to get initated
            L.PM.reInitLayer(layer)
            drawnItems.addLayer(layer)
        })

        return () => {
            map.pm.removeControls()
            map.removeLayer(drawnItems)
            _drawnItems = null
        }
    }, [map])

    return null
}
