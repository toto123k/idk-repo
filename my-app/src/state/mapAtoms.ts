import { atom } from 'jotai';

// Define the structure for a map layer
export interface MapLayer {
    id: string;
    name: string;
    url: string;
    attribution: string;
}

// Define our list of available map layers
export const MAP_LAYERS: MapLayer[] = [
    {
        id: 'esri_imagery',
        name: 'Esri Imagery',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© <a href="https://www.esri.com/">Esri</a>',
    },
    {
        id: 'osm_standard',
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
];

// Atom to hold the list of all map layers
export const mapLayersAtom = atom<MapLayer[]>(MAP_LAYERS);

// Atom to hold the ID of the currently selected map layer
// We initialize it with the ID of our default layer
export const selectedMapLayerIdAtom = atom<string>(MAP_LAYERS[0].id);

// A derived atom that provides the full object of the currently selected layer.
// This is very efficient, as components can subscribe just to this.
export const selectedMapLayerAtom = atom((get) => {
    const layers = get(mapLayersAtom);
    const selectedId = get(selectedMapLayerIdAtom);
    // Find the layer object that matches the selected ID
    const selectedLayer = layers.find(layer => layer.id === selectedId);
    // Fallback to the first layer if something goes wrong
    return selectedLayer || layers[0];
});