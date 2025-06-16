// src/components/MapShell/MapShell.tsx

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import type { LatLngTuple } from '../../types';
import 'leaflet/dist/leaflet.css';
import { AttributionControl } from 'react-leaflet';

interface MapShellProps {
    center: LatLngTuple;
    zoom: number;
    children?: React.ReactNode;
}

export const MapShell: React.FC<MapShellProps> = ({ center, zoom, children }) => {
    return (
        <MapContainer
            // Add this prop to remove the default attribution control
            attributionControl={false}
            doubleClickZoom={false}
            center={center}
            zoom={zoom}
            style={{ height: '100vh', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer

                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <AttributionControl position="topright" />
            <ZoomControl position='topright' />
            {children}
        </MapContainer>
    );
};