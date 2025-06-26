import { FC, useState } from 'react'
import { fromLatLon, toLatLon } from 'utm'
import { Stack, TextField, Typography, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

interface Props {
    lat: number
    lng: number
    disabled: boolean
    onUpdate: (pos: { lat: number; lng: number }) => void
}

export const UtmGroup: FC<Props> = ({ lat, lng, disabled, onUpdate }) => {
    const { zoneNum, zoneLetter, easting, northing } = fromLatLon(lat, lng)
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState({
        zone: `${zoneNum}${zoneLetter}`,
        easting: Math.round(easting).toString(),
        northing: Math.round(northing).toString()
    })

    const commit = () => {
        const match = draft.zone.match(/^(\d+)([C-HJ-NP-X])$/i)
        const parsedE = parseFloat(draft.easting)
        const parsedN = parseFloat(draft.northing)
        if (!match || isNaN(parsedE) || isNaN(parsedN)) return
        const [, zoneNumStr, zoneLetter] = match
        const converted = toLatLon(parsedE, parsedN, +zoneNumStr, zoneLetter.toUpperCase())
        onUpdate({ lat: converted.latitude, lng: converted.longitude })
        setIsEditing(false)
    }

    const cancel = () => {
        setIsEditing(false)
        setDraft({
            zone: `${zoneNum}${zoneLetter}`,
            easting: Math.round(easting).toString(),
            northing: Math.round(northing).toString()
        })
    }

    return (
        <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">UTM</Typography>
                {!disabled && !isEditing && (
                    <IconButton onClick={() => setIsEditing(true)} size="small">
                        <EditIcon />
                    </IconButton>
                )}
                {isEditing && (
                    <Stack direction="row">
                        <IconButton onClick={commit} size="small"><CheckIcon /></IconButton>
                        <IconButton onClick={cancel} size="small"><CloseIcon /></IconButton>
                    </Stack>
                )}
            </Stack>

            <Stack spacing={1}>
                {isEditing ? (
                    <>
                        <TextField label="Zone" size="small" value={draft.zone} onChange={e => setDraft(d => ({ ...d, zone: e.target.value }))} />
                        <TextField label="Easting" size="small" value={draft.easting} onChange={e => setDraft(d => ({ ...d, easting: e.target.value }))} />
                        <TextField label="Northing" size="small" value={draft.northing} onChange={e => setDraft(d => ({ ...d, northing: e.target.value }))} />
                    </>
                ) : (
                    <>
                        <Typography variant="body2">Zone: {zoneNum}{zoneLetter}</Typography>
                        <Typography variant="body2">Easting: {Math.round(easting)}</Typography>
                        <Typography variant="body2">Northing: {Math.round(northing)}</Typography>
                    </>
                )}
            </Stack>
        </Stack>
    )
}
