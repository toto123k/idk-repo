import { Box, IconButton, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface Props {
  expanded: boolean
  onToggle: () => void
}

const headerSx = {
  p: 1.5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
};

const headerTitleSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

const iconSx = { color: 'inherit' }
export const RestrictedZonesHeader: React.FC<Props> = ({ expanded, onToggle }) => (
  <Box
    sx={headerSx}
  >
    <Box sx={headerTitleSx}>
      <WarningIcon />
      <Typography variant="subtitle1" fontWeight="bold">
        Restricted Zones
      </Typography>
    </Box>
    <IconButton size="small" onClick={onToggle} sx={{ iconSx }}>
      {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    </IconButton>
  </Box>
)

