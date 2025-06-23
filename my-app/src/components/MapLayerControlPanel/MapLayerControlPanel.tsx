import { useState } from 'react';
import { useAtom } from 'jotai';
import { Box, Button, Stack, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { mapLayersAtom, selectedMapLayerIdAtom } from '../../state/mapAtoms';
import type { MapLayer } from '../../state/mapAtoms';
import { toast } from 'react-toastify';
import { AddLayerModal } from './AddLayerModal/AddLayerModal';
import type { SxProps, Theme } from '@mui/material/styles';

const panelSx: SxProps<Theme> = {
    backgroundColor: 'background.paper',
    p: 1.5,
    borderRadius: 1,
    boxShadow: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
};

const titleSx: SxProps<Theme> = {
    px: 1,
    mb: 1,
};

const addButtonSx: SxProps<Theme> = {
    alignSelf: 'center',
    mt: 1,
};

export const MapLayerControlPanel: React.FC = () => {
    const [layers, setLayers] = useAtom(mapLayersAtom);
    const [selectedId, setSelectedId] = useAtom(selectedMapLayerIdAtom);
    const [modalOpen, setModalOpen] = useState(false);

    const handleSelectLayer = (layer: MapLayer) => {
        setSelectedId(layer.id);
        toast.success(`Switched to ${layer.name} view`);
    };

    const handleAddLayer = (name: string, url: string) => {
        if (!name.trim() || !url.trim()) {
            toast.error('Name and URL cannot be empty.');
            return;
        }
        if (!url.includes('{z}') || !url.includes('{x}') || !url.includes('{y}')) {
            toast.error('URL must be a template containing {z}, {x}, and {y}.');
            return;
        }

        const newId = name.trim().toLowerCase().replace(/\s+/g, '-');
        if (layers.some(layer => layer.id === newId)) {
            toast.error('A layer with this name already exists.');
            return;
        }

        const newLayer: MapLayer = {
            id: newId, name: name.trim(), url: url.trim(),
        };

        setLayers(prevLayers => [...prevLayers, newLayer]);
        toast.success(`Added "${newLayer.name}" layer!`);
        setModalOpen(false);
    };

    return (
        <>
            <Box sx={panelSx}>
                <Typography variant="subtitle2" sx={titleSx}>Map Layers</Typography>
                <Stack spacing={1}>
                    {layers.map((layer) => (
                        <Button
                            key={layer.id}
                            variant={layer.id === selectedId ? 'contained' : 'outlined'}
                            disabled={layer.id === selectedId}
                            onClick={() => handleSelectLayer(layer)}
                        >
                            {layer.name}
                        </Button>
                    ))}
                </Stack>
                <IconButton onClick={() => setModalOpen(true)} size="small" aria-label="add new layer" sx={addButtonSx}>
                    <AddIcon />
                </IconButton>
            </Box>

            <AddLayerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAddLayer={handleAddLayer}
            />
        </>
    );
};