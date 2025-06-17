// src/components/RestrictedZonesControlPanel.tsx
import { useState } from 'react'
import {
    Paper,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    ListItemButton,
    Typography,
    Box,
    Divider,
    TextField,
    Button,
    Collapse,
    Tooltip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material'
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Cancel as CancelIcon,
    Check as CheckIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Warning as WarningIcon,
} from '@mui/icons-material'
import MapIcon from '@mui/icons-material/Map'
import AddLocationIcon from '@mui/icons-material/AddLocation'
import { useAtom, useAtomValue } from 'jotai'
import {
    restrictedZonesAtom,
    drawingModeAtom,
    selectedZoneIdAtom,
    isDrawingAtom,
    isEditingAtom,
    isDeletingAtom,
    type RestrictedZone,
} from '../../state/restrictedZonesAtoms'
import { drawHandlersAtom } from '../../state/restrictedZonesAtoms'
import { toast } from 'react-toastify'
import CoordinatesModal from '../CoordinatesModal/CoordinatesModal'

export const RestrictedZonesControlPanel = () => {
    const [zones, setZones] = useAtom(restrictedZonesAtom)
    const [drawingMode, setDrawingMode] = useAtom(drawingModeAtom)
    const [selectedZoneId, setSelectedZoneId] = useAtom(selectedZoneIdAtom)

    const isDrawing = useAtomValue(isDrawingAtom)
    const isEditing = useAtomValue(isEditingAtom)
    const isDeleting = useAtomValue(isDeletingAtom)
    const drawHandlers = useAtomValue(drawHandlersAtom)

    const [expanded, setExpanded] = useState(true)
    const [editingNameId, setEditingNameId] = useState<string | null>(null)
    const [tempName, setTempName] = useState('')

    // modal state
    const [newZoneDialogOpen, setNewZoneDialogOpen] = useState(false)
    const [coordsModalOpen, setCoordsModalOpen] = useState(false)

    const handleStartDrawing = () => {
        drawHandlers?.startDraw()
        setDrawingMode('drawing')
        setSelectedZoneId(null)
    }
    const handleCancelDrawing = () => {
        drawHandlers?.cancelDraw()
        setDrawingMode('idle')
    }

    const handleStartEditing = () => {
        drawHandlers?.startEdit()
        setDrawingMode('editing')
    }
    const handleFinishEditing = () => {
        drawHandlers?.saveEdit()
        setDrawingMode('idle')
    }

    // **Deleting**
    const handleStartDeleting = () => {
        drawHandlers?.startDelete()
        setDrawingMode('deleting')
        setSelectedZoneId(null)
    }
    const handleFinishDeleting = () => {
        drawHandlers?.saveDelete()
        setDrawingMode('idle')
    }

    // **Naming**
    const handleStartNameEdit = (z: RestrictedZone) => {
        setEditingNameId(z.id)
        setTempName(z.name)
    }
    const handleSaveName = () => {
        if (editingNameId && tempName.trim()) {
            setZones(zones.map(z =>
                z.id === editingNameId
                    ? { ...z, name: tempName.trim() }
                    : z
            ))
        }
        setEditingNameId(null)
        setTempName('')
    }
    const handleCancelNameEdit = () => {
        setEditingNameId(null)
        setTempName('')
    }

    // **List selection**
    const handleZoneClick = (zoneId: string) => {
        if (drawingMode !== 'idle') return
        setSelectedZoneId(zoneId === selectedZoneId ? null : zoneId)
    }

    // **“New Zone…” dialog**
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

    // **When coords-modal submits**
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

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <>
            <Paper elevation={3} sx={{ width: 300 }}>
                {/* Header */}
                <Box
                    sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Restricted Zones
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(e => !e)}
                        sx={{ color: 'inherit' }}
                    >
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ p: 2 }}>
                        {/* Action Buttons */}
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            {drawingMode === 'idle' && (
                                <>
                                    <Tooltip title="Create new zone">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={openNewZoneDialog}
                                            fullWidth
                                        >
                                            New Zone
                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="Edit selected zone">
                                        <span>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={handleStartEditing}
                                                disabled={zones.length === 0}
                                            >
                                                Edit
                                            </Button>
                                        </span>
                                    </Tooltip>

                                    <Tooltip title="Delete zones">
                                        <span>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={handleStartDeleting}
                                                disabled={zones.length === 0}
                                            >
                                                Delete
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </>
                            )}

                            {isDrawing && (
                                <>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        Click points to draw zone
                                    </Typography>
                                    <Tooltip title="Cancel drawing">
                                        <IconButton
                                            size="small"
                                            onClick={handleCancelDrawing}
                                            color="error"
                                        >
                                            <CancelIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}

                            {isEditing && (
                                <>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        Drag points to edit
                                    </Typography>
                                    <Tooltip title="Done editing">
                                        <IconButton
                                            size="small"
                                            onClick={handleFinishEditing}
                                            color="primary"
                                        >
                                            <CheckIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}

                            {isDeleting && (
                                <>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        Click zones to delete
                                    </Typography>
                                    <Tooltip title="Done deleting">
                                        <IconButton
                                            size="small"
                                            onClick={handleFinishDeleting}
                                            color="primary"
                                        >
                                            <CheckIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </Stack>

                        <Divider sx={{ mb: 1 }} />

                        {/* Zones List */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {zones.length} zone{zones.length !== 1 ? 's' : ''} defined
                        </Typography>

                        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                            {zones.map(z => (
                                <ListItem key={z.id} disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton
                                        selected={z.id === selectedZoneId}
                                        disabled={drawingMode !== 'idle'}
                                        onClick={() => handleZoneClick(z.id)}
                                        sx={{
                                            borderRadius: 1,
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.light',
                                                '&:hover': { bgcolor: 'primary.light' },
                                            },
                                        }}
                                    >
                                        {editingNameId === z.id ? (
                                            <TextField
                                                value={tempName}
                                                onChange={e => setTempName(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && handleSaveName()}
                                                size="small"
                                                fullWidth
                                                autoFocus
                                                onClick={e => e.stopPropagation()}
                                            />
                                        ) : (
                                            <ListItemText
                                                primary={z.name}
                                                secondary={`${z.coordinates.length} points`}
                                            />
                                        )}
                                    </ListItemButton>
                                    <ListItemSecondaryAction>
                                        {editingNameId === z.id ? (
                                            <>
                                                <IconButton size="small" onClick={handleSaveName}>
                                                    <CheckIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={handleCancelNameEdit}>
                                                    <CancelIcon fontSize="small" />
                                                </IconButton>
                                            </>
                                        ) : drawingMode === 'idle' ? (
                                            <IconButton
                                                size="small"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    handleStartNameEdit(z)
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        ) : null}
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>

                        {zones.length === 0 && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ py: 2 }}
                            >
                                No restricted zones defined
                            </Typography>
                        )}
                    </Box>
                </Collapse>
            </Paper>

            {/* ─── “New Zone” Choice Dialog ─────────────────────────────────────── */}
            <Dialog open={newZoneDialogOpen} onClose={closeNewZoneDialog}>
                <DialogTitle>Create new zone</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, mb: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<MapIcon />}
                            onClick={chooseDrawOnMap}
                            fullWidth
                        >
                            Draw on map
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<AddLocationIcon />}
                            onClick={chooseByCoords}
                            fullWidth
                        >
                            By coordinates
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeNewZoneDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* ─── Coordinates Modal (unchanged) ─────────────────────────────── */}
            <CoordinatesModal
                open={coordsModalOpen}
                onClose={() => setCoordsModalOpen(false)}
                onSubmit={handleCoordsSubmit}
            />
        </>
    )
}
