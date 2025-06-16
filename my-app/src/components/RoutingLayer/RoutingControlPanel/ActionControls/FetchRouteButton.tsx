import { Button, CircularProgress } from '@mui/material';
import { useAtom, useSetAtom } from 'jotai';
import { fetchRouteAtom, loadingAtom } from '../../../../state/routingAtoms';

export const FetchRouteButton: React.FC = () => {
    const [loading] = useAtom(loadingAtom);
    const fetchRoute = useSetAtom(fetchRouteAtom);

    return (
        <Button
            variant="contained"
            onClick={() => fetchRoute()}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
            {loading ? 'Fetching…' : 'Fetch Route'}
        </Button>
    );
};