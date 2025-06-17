import { useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { toast } from 'react-toastify'
import {
    restrictedZonesAtom,
    drawingModeAtom,
    selectedZoneIdAtom,
    isDrawingAtom,
    isEditingAtom,
    isDeletingAtom,
    drawHandlersAtom,
    type RestrictedZone,
} from '../../state/restrictedZonesAtoms'
import { CoordinatesModal, type LatLng } from '../CoordinatesModal/CoordinatesModal'
import { Paper, Box, Divider, Collapse, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { ActionButtons } from './ActionButtons/ActionButtons'
import { NewZoneDialog } from './NewZoneDialog/NewZoneDialog'
import { RestrictedZonesHeader } from './RestrictedZonesHeader/RestrictedZonesHeader'
import { ZonesList } from './ZoneList/ZoneList'

const styles = {
    panelContainer: {
        width: 300,
    } as SxProps<Theme>,
    contentBox: {
        p: 2,
    } as SxProps<Theme>,
    divider: {
        mb: 1,
    } as SxProps<Theme>,
    zoneCountText: {
        mb: 1,
    } as SxProps<Theme>,
}

export const RestrictedZonesControlPanel = () => {
    const [zones, setZones] = useAtom(restrictedZonesAtom)
    const [drawingMode, setDrawingMode] = useAtom(drawingModeAtom)
    const [selectedZoneId, setSelectedZoneId] = useAtom(selectedZoneIdAtom)

    const isDrawing = useAtomValue(isDrawingAtom)
    const isEditing = useAtomValue(isEditingAtom)
    const isDeleting = useAtomValue(isDeletingAtom)
    const drawHandlers = useAtomValue(drawHandlersAtom)!

    const [expanded, setExpanded] = useState(true)
    const [editingNameId, setEditingNameId] = useState<string | null>(null)
    const [tempName, setTempName] = useState('')
    const [newZoneDialogOpen, setNewZoneDialogOpen] = useState(false)
    const [coordsModalOpen, setCoordsModalOpen] = useState(false)


    const handleStartDrawing = () => {
        drawHandlers.startDraw?.()
        setDrawingMode('drawing')
        setSelectedZoneId(null)
    }

    const handleCancelDrawing = () => {
        drawHandlers?.cancelDraw?.()
        setDrawingMode('idle')
    }

    const handleStartEditing = () => {
        drawHandlers?.startEdit?.()
        setDrawingMode('editing')
    }
    const handleFinishEditing = () => {
        drawHandlers?.saveEdit?.()
        setDrawingMode('idle')
    }

    const handleStartDeleting = () => {
        drawHandlers?.startDelete?.()
        setDrawingMode('deleting')
        setSelectedZoneId(null)
    }
    const handleFinishDeleting = () => {
        drawHandlers?.saveDelete?.()
        setDrawingMode('idle')
    }

    const handleStartNameEdit = (z: RestrictedZone) => {
        setEditingNameId(z.id)
        setTempName(z.name)
    }
    const handleSaveName = () => {
        if (editingNameId && tempName.trim()) {
            setZones(zones.map(z =>
                z.id === editingNameId ? { ...z, name: tempName.trim() } : z
            ))
        }
        setEditingNameId(null)
        setTempName('')
    }
    const handleCancelNameEdit = () => {
        setEditingNameId(null)
        setTempName('')
    }

    const handleZoneClick = (zoneId: string) => {
        if (drawingMode !== 'idle') return
        setSelectedZoneId(zoneId === selectedZoneId ? null : zoneId)
    }

    // “New Zone…” dialog
    const openNewZoneDialog = () => setNewZoneDialogOpen(true)
    const closeNewZoneDialog = () => setNewZoneDialogOpen(false)
    const chooseDrawOnMap = () => {
        closeNewZoneDialog()
        handleStartDrawing()
    }
    const chooseByCoords = () => {
        closeNewZoneDialog()
        setCoordsModalOpen(true)
    }

    const handleCoordsSubmit = (coords: LatLng[]) => {
        const newZone: RestrictedZone = {
            id: `zone-${Date.now()}`,
            name: `Zone ${zones.length + 1}`,
            coordinates: coords,
            color: '#ff0000',
            fillColor: '#ff0000',
            fillOpacity: 0.2,
        }
        setZones(prev => [...prev, newZone])
        toast.success('Restricted zone created from coordinates')
        setCoordsModalOpen(false)
    }

    return (
        <>
            <Paper elevation={3} sx={styles.panelContainer}>
                <RestrictedZonesHeader
                    expanded={expanded}
                    onToggle={() => setExpanded(e => !e)}
                />

                <Collapse in={expanded}>
                    <Box sx={styles.contentBox}>
                        <ActionButtons
                            drawingMode={drawingMode}
                            isDrawing={isDrawing}
                            isEditing={isEditing}
                            isDeleting={isDeleting}
                            zonesCount={zones.length}
                            onNewZone={openNewZoneDialog}
                            onStartEditing={handleStartEditing}
                            onStartDeleting={handleStartDeleting}
                            onCancelDrawing={handleCancelDrawing}
                            onFinishEditing={handleFinishEditing}
                            onFinishDeleting={handleFinishDeleting}
                        />

                        <Divider sx={styles.divider} />

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={styles.zoneCountText}
                        >
                            {zones.length} zone{zones.length !== 1 ? 's' : ''} defined
                        </Typography>

                        <ZonesList
                            zones={zones}
                            selectedZoneId={selectedZoneId}
                            drawingMode={drawingMode}
                            editingNameId={editingNameId}
                            tempName={tempName}
                            onZoneClick={handleZoneClick}
                            onStartNameEdit={handleStartNameEdit}
                            onSaveName={handleSaveName}
                            onCancelNameEdit={handleCancelNameEdit}
                            onTempNameChange={setTempName}
                        />
                    </Box>
                </Collapse>
            </Paper>

            <NewZoneDialog
                open={newZoneDialogOpen}
                onClose={closeNewZoneDialog}
                onDrawOnMap={chooseDrawOnMap}
                onByCoords={chooseByCoords}
            />

            <CoordinatesModal
                open={coordsModalOpen}
                onClose={() => setCoordsModalOpen(false)}
                onSubmit={handleCoordsSubmit}
            />
        </>
    )
}
