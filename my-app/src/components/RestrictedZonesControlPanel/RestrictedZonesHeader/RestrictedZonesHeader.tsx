import { Box, IconButton, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface Props {
  expanded: boolean
  onToggle: () => void
}

const RestrictedZonesHeader: React.FC<Props> = ({ expanded, onToggle }) => (
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
    <IconButton size="small" onClick={onToggle} sx={{ color: 'inherit' }}>
      {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    </IconButton>
  </Box>
)

export default RestrictedZonesHeader
