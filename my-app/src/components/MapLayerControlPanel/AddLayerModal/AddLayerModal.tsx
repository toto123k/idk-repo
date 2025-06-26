import { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';

interface AddLayerModalProps {
    open: boolean;
    onClose: () => void;
    onAddLayer: (name: string, url: string) => void;
}

export const AddLayerModal: React.FC<AddLayerModalProps> = ({ open, onClose, onAddLayer }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const modalSx = { zIndex: 5000 };
    // Reset fields when the modal opens
    useEffect(() => {
        if (open) {
            setName('');
            setUrl('');
        }
    }, [open]);

    const handleSave = () => {
        onAddLayer(name, url);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="add-layer-dialog-title" sx={modalSx}>
            <DialogTitle id="add-layer-dialog-title">Add New Map Layer</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Layer Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="url"
                    label="Tile URL Template"
                    type="url"
                    fullWidth
                    variant="standard"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g. https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    helperText="URL must include {z}, {x}, {y} placeholders."
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Add</Button>
            </DialogActions>
        </Dialog>
    );
};