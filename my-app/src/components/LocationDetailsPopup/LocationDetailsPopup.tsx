import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import { fromLatLon } from 'utm';
import { type LocationData } from '../../types/types';

const popupContentStyle = {
    padding: '8px 16px',
    minWidth: '280px',
    fontFamily: 'sans-serif',
};

const headerStyle = {
    fontWeight: 'bold',
    textTransform: 'capitalize',
};

const coordinateLabelStyle = {
    fontWeight: 500,
    color: 'text.secondary',
};

const coordinateValueStyle = {
    color: 'text.primary',
    textAlign: 'right',
    marginLeft: 2,
};

interface Props {
    data: LocationData;
}

export const LocationDetailsPopup = ({ data }: Props) => {
    const { easting, northing, zoneNum, zoneLetter } = fromLatLon(
        data.position[0],
        data.position[1]
    );

    return (
        <Box sx={popupContentStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6" sx={headerStyle}>
                    {data.type} Point
                </Typography>
                <Chip
                    label={data.type.toUpperCase()}
                    color={data.type === 'source' ? 'primary' : 'error'}
                    size="small"
                />
            </Stack>

            <Divider />

            <Box mt={1.5}>
                <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography sx={coordinateLabelStyle} variant="body2">Lat/Lng:</Typography>
                        <Typography sx={coordinateValueStyle} variant="body2">{`${data.position[0].toFixed(4)}, ${data.position[1].toFixed(4)}`}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography sx={coordinateLabelStyle} variant="body2">UTM:</Typography>
                        <Typography sx={coordinateValueStyle} variant="body2">{`${zoneNum}${zoneLetter} ${easting.toFixed(0)} ${northing.toFixed(0)}`}</Typography>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
};