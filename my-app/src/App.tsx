import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

import { LocationMarker } from './components/LocationMarker/LocationMarker';

type LatLngTuple = [number, number];

const start: LatLngTuple = [34.7818, 32.0853]; // Tel Aviv
const end: LatLngTuple = [35.2137, 31.7683];   // Jerusalem

export const  App = () => {
  const [route, setRoute] = useState<LatLngTuple[] | null>(null);

  useEffect(() => {
    let fetched = false;

    const fetchRoute = async () => {
      try {
        const url = `http://localhost:8000/route?start=${start.join(',')}&end=${end.join(',')}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (!fetched) setRoute(data.route);
      } catch (err) {
        console.error('Failed to fetch route:', err);
      }
    };

    fetchRoute();
    return () => {
      fetched = true;
    };
  }, []);

  return (
    <MapContainer center={[31.5, 34.8]} zoom={8} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='© <a href="https://www.esri.com/">Esri</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      <LocationMarker data={{ type: 'source', position: [32.0853, 34.7818] }} />
      <LocationMarker data={{ type: 'target', position: [31.7683, 35.2137] }} />

      {route && <Polyline positions={route} pathOptions={{ color: 'red', weight: 4 }} />}
    </MapContainer>
  );
}


