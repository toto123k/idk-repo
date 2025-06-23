import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngLiteral } from 'leaflet';
import { useAtomValue } from 'jotai';
import { selectedMapLayerAtom } from '../../state/mapAtoms';

interface MapShellProps {
    center: LatLngLiteral;
    zoom: number;
    children?: React.ReactNode;
}

export const MapShell: React.FC<MapShellProps> = ({ center, zoom, children }) => {
    const selectedLayer = useAtomValue(selectedMapLayerAtom);

    return (
        <MapContainer
            attributionControl={false}
            doubleClickZoom={false}
            center={center}
            zoom={zoom}
            style={{ height: '100vh', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                key={selectedLayer.id}
                attribution={selectedLayer.attribution}
                url={selectedLayer.url}
            />
            {children}
        </MapContainer>
    );
};