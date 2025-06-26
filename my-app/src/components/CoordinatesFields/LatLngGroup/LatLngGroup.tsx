import { FC, useState } from 'react'
import { Stack, IconButton, TextField, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

interface Props {
  lat: number
  lng: number
  disabled: boolean
  onUpdate: (pos: { lat: number; lng: number }) => void
}

export const LatLngGroup: FC<Props> = ({ lat, lng, disabled, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({ lat: lat.toFixed(6), lng: lng.toFixed(6) })

  const commit = () => {
    const parsedLat = parseFloat(draft.lat)
    const parsedLng = parseFloat(draft.lng)
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onUpdate({ lat: parsedLat, lng: parsedLng })
      setIsEditing(false)
    }
  }

  const cancel = () => {
    setIsEditing(false)
    setDraft({ lat: lat.toFixed(6), lng: lng.toFixed(6) })
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">Lat / Lng</Typography>
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
            <TextField label="Latitude" size="small" value={draft.lat} onChange={e => setDraft(d => ({ ...d, lat: e.target.value }))} />
            <TextField label="Longitude" size="small" value={draft.lng} onChange={e => setDraft(d => ({ ...d, lng: e.target.value }))} />
          </>
        ) : (
          <>
            <Typography variant="body2">Lat: {lat.toFixed(6)}</Typography>
            <Typography variant="body2">Lng: {lng.toFixed(6)}</Typography>
          </>
        )}
      </Stack>
    </Stack>
  )
}
