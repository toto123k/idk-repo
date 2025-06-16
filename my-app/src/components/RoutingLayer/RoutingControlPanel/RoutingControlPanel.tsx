import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { FetchRouteButton } from './ActionControls/FetchRouteButton';

const panelStyles: SxProps<Theme> = {
    position: 'absolute',
    bottom: (theme) => theme.spacing(2),
    right: (theme) => theme.spacing(2),
    zIndex: (theme) => theme.zIndex.tooltip,
    backgroundColor: 'background.paper',
    p: 1.5,
    borderRadius: 1,
    boxShadow: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: (theme) => theme.spacing(2),
};

export const RoutingControlPanel: React.FC = () => {

    return (
        <Box
            sx={panelStyles}
        >
            <FetchRouteButton />
        </Box>
    );
};