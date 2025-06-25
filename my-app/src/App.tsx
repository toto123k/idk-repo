import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

import { LocationMarker } from './components/LocationMarker/LocationMarker';
import type { LatLngLiteral } from 'leaflet'


const start: LatLngLiteral = { lat: 32.0853, lng: 34.7818 }; // Tel Aviv
const end: LatLngLiteral = { lat: 31.7683, lng: 35.2137 };   // Jerusalem

export const App = () => {
  const mapSx = { height: '100vh', width: '100%' };

  return (
    <MapContainer center={[31.5, 34.8]} zoom={8} style={mapSx}>
      <TileLayer
        attribution='© <a href="https://www.esri.com/">Esri</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      <LocationMarker type='source' position={start} />
      <LocationMarker type='target' position={end} />

    </MapContainer>
  );
}
