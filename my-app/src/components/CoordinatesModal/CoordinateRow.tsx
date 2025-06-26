import { type FC, memo, useState, useEffect, useCallback } from 'react'
import { Box, TextField, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

interface CoordinateRowProps {
    index: number
    lat: string
    lng: string
    onChange: (index: number, field: 'lat' | 'lng', value: string) => void
    onRemove: (index: number) => void
    disableRemove: boolean
}

export const CoordinateRow: FC<CoordinateRowProps> = memo(
    ({ index, lat, lng, onChange, onRemove, disableRemove }) => {
        const [latError, setLatError] = useState<string>()
        const [lngError, setLngError] = useState<string>()

        useEffect(() => {
            const v = parseFloat(lat)
            setLatError(isNaN(v) || v < -90 || v > 90 ? 'Must be between –90 and 90' : undefined)
        }, [lat])

        useEffect(() => {
            const v = parseFloat(lng)
            setLngError(isNaN(v) || v < -180 || v > 180 ? 'Must be between –180 and 180' : undefined)
        }, [lng])

        const handleLatChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(index, 'lat', e.target.value)
            },
            [index, onChange]
        )

        const handleLngChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(index, 'lng', e.target.value)
            },
            [index, onChange]
        )

        const handleRemove = useCallback(() => {
            onRemove(index)
        }, [index, onRemove])

        return (
            <Box display="flex" alignItems="center" mb={1}>
                <TextField
                    id={`coordinate-lat-${index}`}

                    label="Latitude"
                    value={lat}
                    onChange={handleLatChange}
                    error={!!latError}
                    helperText={latError}
                    fullWidth
                />
                <Box mx={1} />
                <TextField
                    id={`coordinate-lng-${index}`}
                    label="Longitude"
                    value={lng}
                    onChange={handleLngChange}
                    error={!!lngError}
                    helperText={lngError}
                    fullWidth
                />
                <IconButton onClick={handleRemove} disabled={disableRemove}>
                    <DeleteIcon />
                </IconButton>
            </Box>
        )
    }
)
