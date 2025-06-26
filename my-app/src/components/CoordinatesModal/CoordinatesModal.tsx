import { type FC, useState, useCallback } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'
import CancelIcon from '@mui/icons-material/Cancel'
import { CoordinateRows } from './CoordinateRows'
import type { LatLngLiteral } from 'leaflet'

interface CoordinatesModalProps {
    open: boolean
    onClose: () => void
    onSubmit: (coords: LatLngLiteral[]) => void
}

export const CoordinatesModal: FC<CoordinatesModalProps> = ({ open, onClose, onSubmit }) => {
    const [rows, setRows] = useState<{ lat: string; lng: string }[]>([
        { lat: '', lng: '' },
        { lat: '', lng: '' },
        { lat: '', lng: '' },
    ])

    const handleChange = useCallback((index: number, field: 'lat' | 'lng', value: string) => {
        setRows(current =>
            current.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        )
    }, [])

    const handleAdd = useCallback(() => {
        setRows(current => [...current, { lat: '', lng: '' }])
    }, [])

    const handleRemove = useCallback((index: number) => {
        setRows(current => current.filter((_, i) => i !== index))
    }, [])

    const isValid =
        rows.length >= 3 &&
        rows.every(({ lat, lng }) => {
            const nl = parseFloat(lat)
            const ng = parseFloat(lng)
            return !isNaN(nl) && nl >= -90 && nl <= 90 && !isNaN(ng) && ng >= -180 && ng <= 180
        })

    const handleCreate = () => {
        if (!isValid) return
        onSubmit(rows.map(r => ({ lat: parseFloat(r.lat), lng: parseFloat(r.lng) })))
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
                <CoordinateRows
                    rows={rows}
                    onChange={handleChange}
                    onRemove={handleRemove}
                    onAdd={handleAdd}
                />
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
