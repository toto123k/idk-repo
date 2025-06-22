// src/components/MapLayerControlPanel.tsx
import { useState } from 'react'
import { useAtom } from 'jotai'
import {
    Paper,
    Box,
    Typography,
    IconButton,
    Collapse,
    Stack,
    Button,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LayersIcon from '@mui/icons-material/Layers'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { mapLayersAtom, selectedMapLayerIdAtom } from '../../state/mapAtoms'
import type { MapLayer } from '../../state/mapAtoms'
import { toast } from 'react-toastify'
import { AddLayerModal } from './AddLayerModal/AddLayerModal'
import type { SxProps, Theme } from '@mui/material/styles'

const panelSx: SxProps<Theme> = {
    backgroundColor: 'background.paper',
    borderRadius: 1,
    boxShadow: 3,
    width: 300,
    overflow: 'hidden',
}

const headerSx: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 2,
    py: 1,
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
}

const headerTitleSx: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
}

const contentSx: SxProps<Theme> = {
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
}

export const MapLayerControlPanel: React.FC = () => {
    const [layers, setLayers] = useAtom(mapLayersAtom)
    const [selectedId, setSelectedId] = useAtom(selectedMapLayerIdAtom)
    const [expanded, setExpanded] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)

    const handleSelectLayer = (layer: MapLayer) => {
        setSelectedId(layer.id)
        toast.success(`Switched to ${layer.name} view`)
    }

    const handleAddLayer = (name: string, url: string) => {
        if (!name.trim() || !url.trim()) {
            toast.error('Name and URL cannot be empty.')
            return
        }
        if (!url.includes('{z}') || !url.includes('{x}') || !url.includes('{y}')) {
            toast.error('URL must be a template containing {z}, {x}, and {y}.')
            return
        }

        const newId = name.trim().toLowerCase().replace(/\s+/g, '-')
        if (layers.some(l => l.id === newId)) {
            toast.error('A layer with this name already exists.')
            return
        }

        const newLayer: MapLayer = {
            id: newId,
            name: name.trim(),
            url: url.trim(),
        }
        setLayers(prev => [...prev, newLayer])
        toast.success(`Added "${newLayer.name}" layer!`)
        setModalOpen(false)
    }

    const iconButtonSx = { alignSelf: 'center', mt: 1 };
    return (
        <>
            <Paper elevation={3} sx={panelSx}>
                <Box sx={headerSx}>
                    <Box sx={headerTitleSx}>
                        <LayersIcon />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Map Layers
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
                    <Box sx={contentSx}>
                        <Stack spacing={1}>
                            {layers.map(layer => (
                                <Button
                                    key={layer.id}
                                    variant={layer.id === selectedId ? 'contained' : 'outlined'}
                                    disabled={layer.id === selectedId}
                                    onClick={() => handleSelectLayer(layer)}
                                    fullWidth
                                    size="small"
                                >
                                    {layer.name}
                                </Button>
                            ))}
                        </Stack>

                        <IconButton
                            size="small"
                            id='open-map-layer-dialog-button'
                            onClick={() => setModalOpen(true)}
                            aria-label="Add new layer"
                            sx={iconButtonSx}
                        >
                            <AddIcon />
                        </IconButton>
                    </Box>
                </Collapse>
            </Paper>

            <AddLayerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAddLayer={handleAddLayer}
            />
        </>
    )
}
