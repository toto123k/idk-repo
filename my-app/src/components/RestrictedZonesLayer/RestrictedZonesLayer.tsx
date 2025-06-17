// src/components/RestrictedZonesLayer.tsx
import { useEffect, useRef } from 'react'
import { FeatureGroup } from 'react-leaflet'
import { useAtom, useSetAtom } from 'jotai'
import L from 'leaflet'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import {
    restrictedZonesAtom,
    drawingModeAtom,
    selectedZoneIdAtom,
    tempPolygonAtom,
    type RestrictedZone
} from '../../state/restrictedZonesAtoms'
import { drawHandlersAtom } from '../../state/restrictedZonesAtoms'
import { toast } from 'react-toastify'

// ———— Helper to safely extract handlers ————
export const getDrawHandlers = (drawControlRef: React.MutableRefObject<any>) => {
    const tb = drawControlRef.current?._toolbars
    const drawH = tb?.draw?._modes?.polygon?.handler
    const editH = tb?.edit?._modes?.edit?.handler
    const remH = tb?.edit?._modes?.remove?.handler

    return {
        startDraw: () => drawH?.enable?.(),
        cancelDraw: () => drawH?.disable?.(),
        completeDraw: () => { drawH?.completeShape?.(); drawH?.disable?.() },

        startEdit: () => editH?.enable?.(),
        saveEdit: () => { editH?.save?.(); editH?.disable?.() },
        cancelEdit: () => editH?.disable?.(),

        startDelete: () => remH?.enable?.(),
        saveDelete: () => { remH?.save?.(); remH?.disable?.() },
    }
}


export const RestrictedZonesLayer = () => {
    const [zones, setZones] = useAtom(restrictedZonesAtom)
    const [drawingMode, setDrawingMode] = useAtom(drawingModeAtom)
    const [selectedZoneId, setSelectedZoneId] = useAtom(selectedZoneIdAtom)
    const setTempPolygon = useSetAtom(tempPolygonAtom)
    const setDrawHandlers = useSetAtom(drawHandlersAtom)

    const featureGroupRef = useRef<L.FeatureGroup>(null!)
    const drawControlRef = useRef<L.Control.Draw>(null!)
    const mapRef = useRef<L.Map>(null!)
    const handlersSetRef = useRef(false)

    // 1) Hide the built-in toolbar
    useEffect(() => {
        const style = document.createElement('style')
        style.textContent = `
      .leaflet-draw-section, .leaflet-draw-toolbar { display: none !important; }
    `
        document.head.appendChild(style)
        return () => { document.head.removeChild(style) }
    }, [])

    // 2) Initialize control, hook events, and capture handlers
    useEffect(() => {
        const fg = featureGroupRef.current
        if (!fg) return
        const map = (fg as any)._map as L.Map
        if (!map) return
        mapRef.current = map

        // — add the Draw control exactly once —
        if (!drawControlRef.current) {
            drawControlRef.current = new L.Control.Draw({
                draw: {
                    polygon: {
                        allowIntersection: false,
                        shapeOptions: { color: '#ff0000', fillColor: '#ff0000', fillOpacity: 0.2 }
                    },
                    polyline: false,
                    circle: false,
                    rectangle: false,
                    marker: false,
                    circlemarker: false
                },
                edit: { featureGroup: fg }
            })
            map.addControl(drawControlRef.current)
        }

        // — once the control’s internal _toolbars exist, stash out the handlers —
        const tb = (drawControlRef.current as any)?._toolbars
        if (tb && !handlersSetRef.current) {
            setDrawHandlers(getDrawHandlers(drawControlRef))
            handlersSetRef.current = true
        }

        // — your existing create/edit/delete listeners —
        const handleCreated = (e: any) => {
            const layer = e.layer
            const coords = (layer.getLatLngs()[0] as L.LatLng[]).map(p => ({ lat: p.lat, lng: p.lng }))
            const newZone: RestrictedZone = {
                id: `zone-${Date.now()}`,
                name: `Zone ${zones.length + 1}`,
                coordinates: coords,
                color: '#ff0000',
                fillColor: '#ff0000',
                fillOpacity: 0.2
            }
            setZones(prev => [...prev, newZone])
            setDrawingMode('idle')
            toast.success('Restricted zone created')
        }

        const handleEdited = (e: any) => {
            e.layers.eachLayer((layer: any) => {
                const zid = layer.zoneId || layer.options?.zoneId || layer._zoneId
                if (!zid) return
                const coords = (layer.getLatLngs()[0] as L.LatLng[]).map(p => ({ lat: p.lat, lng: p.lng }))
                setZones(prev => prev.map(z => z.id === zid ? { ...z, coordinates: coords } : z))
            })
            setDrawingMode('idle')
            toast.success('Zone updated')
        }

        const handleDeleted = (e: any) => {
            // collect exactly which zoneIds were deleted
            const removedIds: string[] = []
            e.layers.eachLayer((layer: any) => {
                const zid = layer.zoneId || layer.options?.zoneId || layer._zoneId
                if (zid) removedIds.push(zid)
            })

            if (removedIds.length === 0) {
                // nothing to do
                setDrawingMode('idle')
                return
            }

            // immediately filter your Jotai atom by removedIds
            setZones(prev => {
                const remaining = prev.filter(z => !removedIds.includes(z.id))
                toast.success(`${removedIds.length} zone(s) deleted`)
                return remaining
            })

            // if the deleted zone was selected, clear it
            if (removedIds.includes(selectedZoneId!)) {
                setSelectedZoneId(null)
            }

            // now, and only now, go back to idle
            setDrawingMode('idle')
        }


        map.on(L.Draw.Event.CREATED, handleCreated)
        map.on(L.Draw.Event.EDITED, handleEdited)
        map.on(L.Draw.Event.DELETED, handleDeleted)

        return () => {
            map.off(L.Draw.Event.CREATED, handleCreated)
            map.off(L.Draw.Event.EDITED, handleEdited)
            map.off(L.Draw.Event.DELETED, handleDeleted)
            if (drawControlRef.current) {
                map.removeControl(drawControlRef.current)
            }
        }
    }, [
        setZones,
        setDrawingMode,
        setSelectedZoneId,
        setDrawHandlers,
        zones.length,
        selectedZoneId
    ])

    // 3) On mode change, enable/disable only the handler that exists
    useEffect(() => {
        const tb = drawControlRef.current?._toolbars
        if (!tb) return

        // disable anything that might be active
        tb.draw?._modes?.polygon?.handler?.disable?.()
        tb.edit?._modes?.edit?.handler?.disable?.()
        tb.edit?._modes?.remove?.handler?.disable?.()

        // enable only what we need
        if (drawingMode === 'drawing') tb.draw?._modes?.polygon?.handler?.enable?.()
        if (drawingMode === 'editing') tb.edit?._modes?.edit?.handler?.enable?.()
        if (drawingMode === 'deleting') tb.edit?._modes?.remove?.handler?.enable?.()
    }, [drawingMode])

    // 4) Re-draw all your polygons whenever zones change
    useEffect(() => {
        const fg = featureGroupRef.current
        const map = mapRef.current
        if (!fg || !map) return
        fg.clearLayers()

        zones.forEach(zone => {
            const isSel = zone.id === selectedZoneId
            const poly = L.polygon(
                zone.coordinates.map(c => [c.lat, c.lng] as [number, number]),
                {
                    color: isSel ? '#0066ff' : zone.color,
                    fillColor: zone.fillColor,
                    fillOpacity: zone.fillOpacity,
                    weight: isSel ? 3 : 2
                }
            )
                ; (poly as any).zoneId = zone.id
            poly.on('click', () => {
                if (drawingMode === 'idle') {
                    setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id)
                }
            })
            fg.addLayer(poly)
        })
    }, [zones, drawingMode, selectedZoneId, setSelectedZoneId])

    return <FeatureGroup ref={featureGroupRef} />
}
