import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

import type { LocationData } from './types/types';
import LocationMarker from './components/LocationMarker/LocationMarker';

// Sample data is simplified according to the new type
const sampleLocations: LocationData[] = [
  { type: 'source', position: [32.0853, 34.7818] },
  { type: 'target', position: [31.7683, 35.2137] },
  { type: 'source', position: [32.7940, 34.9896] },
  { type: 'target', position: [29.5577, 34.9519] },
  { type: 'target', position: [32.0910, 34.7850] },
];

function App() {
  const [locations] = useState<LocationData[]>(sampleLocations);

  return (
    <MapContainer center={[31.5, 34.8]} zoom={8} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='© <a href="https://www.esri.com/">Esri</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      {/* Use index as the key since IDs are removed and the list is static */}
      {locations.map((location, index) => (
        <LocationMarker key={index} data={location} />
      ))}
    </MapContainer>
  );
}

export default App;