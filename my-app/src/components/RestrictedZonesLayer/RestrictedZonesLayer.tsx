// RestrictedZonesLayer.tsx
import { useEffect, useRef, useState, useCallback, type FC } from 'react'
import { useAtom } from 'jotai'
import { useMap } from 'react-leaflet'
import * as L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography } from '@mui/material'
import { CoordinatesModal } from '../CoordinatesModal/CoordinatesModal'
import type { LatLngLiteral } from 'leaflet'
import { drawnItemsAtom } from '../../state/drawingItemsAtom'

interface InputTypeSelectionDialogProps {
    open: boolean
    onClose: () => void
    onDrawOnMap: () => void
    onEnterCoordinates: () => void
}

const InputTypeSelectionDialog: FC<InputTypeSelectionDialogProps> = ({
    open, onClose, onDrawOnMap, onEnterCoordinates
}) => (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Add New Zone</DialogTitle>
        <DialogContent>
            <Typography gutterBottom>How would you like to define the zone?</Typography>
            <Stack spacing={2} mt={2}>
                <Button variant="outlined" onClick={() => { onDrawOnMap(); onClose() }}>
                    Draw on Map
                </Button>
                <Button variant="outlined" onClick={() => { onEnterCoordinates(); onClose() }}>
                    Enter Coordinates Manually
                </Button>
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
    </Dialog>
)

export const RestrictedZonesLayer: FC = () => {
    const map = useMap()
    const [drawnItems] = useAtom(drawnItemsAtom)
    const controlAddedRef = useRef(false)
    const [inputModalOpen, setInputModalOpen] = useState(false)
    const [coordsModalOpen, setCoordsModalOpen] = useState(false)

    const openInputModal = useCallback(() => setInputModalOpen(true), [])

    const startDrawing = () => {
        map.pm?.enableDraw('Polygon', { snappable: true, snapDistance: 20 })
    }

    const openCoordsModal = () => setCoordsModalOpen(true)

    const submitCoordinates = (coords: LatLngLiteral[]) => {
        if (coords.length < 3) {
            console.warn('Need at least 3 points')
            setCoordsModalOpen(false)
            return
        }
        const polygon = L.polygon(coords)
        polygon.options.pmIgnore = false
        L.PM.reInitLayer(polygon)
        drawnItems.addLayer(polygon)
        map.fire('pm:create', { layer: polygon, shape: 'Polygon' })
        setCoordsModalOpen(false)
    }

    useEffect(() => {
        if (!map.pm) return
        L.PM.setOptIn(true)
        map.addLayer(drawnItems)

        if (!controlAddedRef.current && map.pm.Toolbar) {
            map.pm.Toolbar.createCustomControl({
                name: 'AddZoneWithOptions',
                block: 'edit',
                title: 'Add Zone (Draw or Coordinates)',
                onClick: openInputModal,
                className: 'control-icon leaflet-pm-icon-polygon',
                toggle: false
            })
            controlAddedRef.current = true
        }

        map.pm.addControls({
            position: 'topright',
            drawPolygon: false,
            editMode: true,
            dragMode: true,
            removalMode: true,
            rotateMode: true
        })

        const onCreate = (e: any) => drawnItems.addLayer(e.layer)
        const onRemove = (e: any) => {
            if (drawnItems.hasLayer(e.layer)) drawnItems.removeLayer(e.layer)
        }

        map.on('pm:create', onCreate)
        map.on('pm:remove', onRemove)

        return () => {
            map.off('pm:create', onCreate)
            map.off('pm:remove', onRemove)
        }
    }, [map, drawnItems, openInputModal])

    return (
        <>
            <InputTypeSelectionDialog
                open={inputModalOpen}
                onClose={() => setInputModalOpen(false)}
                onDrawOnMap={startDrawing}
                onEnterCoordinates={openCoordsModal}
            />
            <CoordinatesModal
                open={coordsModalOpen}
                onClose={() => setCoordsModalOpen(false)}
                onSubmit={submitCoordinates}
            />
        </>
    )
}
