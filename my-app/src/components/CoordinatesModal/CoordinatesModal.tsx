// src/components/CoordinatesModal.tsx
import { FC, useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    TextField,
    Typography,
    Box,
} from '@mui/material'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material'

export type LatLng = { lat: number; lng: number }

interface CoordinatesModalProps {
    open: boolean
    onClose: () => void
    onSubmit: (coords: LatLng[]) => void
}

const CoordinatesModal: FC<CoordinatesModalProps> = ({ open, onClose, onSubmit }) => {
    // store user input
    const [rows, setRows] = useState<{ lat: string; lng: string }[]>([
        { lat: '', lng: '' },
        { lat: '', lng: '' },
        { lat: '', lng: '' },
    ])

    // validation errors for each row
    const [errors, setErrors] = useState<{ lat?: string; lng?: string }[]>([])

    // overall form validity
    const [isValid, setIsValid] = useState(false)

    // recalc errors + validity whenever rows change
    useEffect(() => {
        const newErrs = rows.map(({ lat, lng }) => {
            const e: { lat?: string; lng?: string } = {}
            const ltn = parseFloat(lat)
            if (isNaN(ltn) || ltn < -90 || ltn > 90) e.lat = 'Must be between –90 and 90'
            const lgn = parseFloat(lng)
            if (isNaN(lgn) || lgn < -180 || lgn > 180) e.lng = 'Must be between –180 and 180'
            return e
        })

        setErrors(newErrs)
        setIsValid(newErrs.every(err => !err.lat && !err.lng) && rows.length >= 3)
    }, [rows])

    const handleChange = (idx: number, field: 'lat' | 'lng', value: string) => {
        const copy = [...rows]
        copy[idx][field] = value
        setRows(copy)
    }

    const handleAdd = () => setRows(r => [...r, { lat: '', lng: '' }])
    const handleRemove = (idx: number) => {
        if (rows.length <= 3) return
        setRows(r => r.filter((_, i) => i !== idx))
    }

    const handleCreate = () => {
        if (!isValid) return
        const parsed: LatLng[] = rows.map(r => ({
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lng),
        }))
        onSubmit(parsed)
        // reset for next time
        setRows([
            { lat: '', lng: '' },
            { lat: '', lng: '' },
            { lat: '', lng: '' },
        ])
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Define Polygon by Coordinates</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Enter at least three latitude/longitude pairs.
                </Typography>

                {rows.map((r, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            label="Latitude"
                            value={r.lat}
                            onChange={e => handleChange(idx, 'lat', e.target.value)}
                            error={!!errors[idx]?.lat}
                            helperText={errors[idx]?.lat}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Longitude"
                            value={r.lng}
                            onChange={e => handleChange(idx, 'lng', e.target.value)}
                            error={!!errors[idx]?.lng}
                            helperText={errors[idx]?.lng}
                            size="small"
                            fullWidth
                        />
                        <IconButton onClick={() => handleRemove(idx)} disabled={rows.length <= 3}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ))}

                <Box textAlign="center">
                    <Button startIcon={<AddIcon />} onClick={handleAdd}>
                        Add Coordinate
                    </Button>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button startIcon={<CancelIcon />} onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleCreate} disabled={!isValid}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default CoordinatesModal
