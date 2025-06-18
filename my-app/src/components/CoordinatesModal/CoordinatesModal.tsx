// src/components/CoordinatesModal.tsx
import { type FC, useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'
import { CoordinateRows } from './CoordinateRows'
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

export const CoordinatesModal: FC<CoordinatesModalProps> = ({ open, onClose, onSubmit }) => {
    const [rows, setRows] = useState<{ lat: string; lng: string }[]>([
        { lat: '', lng: '' },
        { lat: '', lng: '' },
        { lat: '', lng: '' },
    ])

    const [errors, setErrors] = useState<{ lat?: string; lng?: string }[]>([])

    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        const newErrs = rows.map(({ lat, lng }) => {
            const inputError: { lat?: string; lng?: string } = {}
            const ltn = parseFloat(lat)
            if (isNaN(ltn) || ltn < -90 || ltn > 90) inputError.lat = 'Must be between –90 and 90'
            const lgn = parseFloat(lng)
            if (isNaN(lgn) || lgn < -180 || lgn > 180) inputError.lng = 'Must be between –180 and 180'
            return inputError
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

                <CoordinateRows rows={rows} errors={errors} onChange={handleChange} onRemove={handleRemove} onAdd={handleAdd} />
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
