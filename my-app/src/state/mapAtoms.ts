import { atom } from 'jotai';

export interface MapLayer {
    id: string;
    name: string;
    url: string;
}

export const MAP_LAYERS: MapLayer[] = [
    {
        id: 'esri_imagery',
        name: 'Esri Imagery',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    },
    {
        id: 'osm_standard',
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    },
];

export const mapLayersAtom = atom<MapLayer[]>(MAP_LAYERS);


export const selectedMapLayerIdAtom = atom<string>(MAP_LAYERS[0].id);


export const selectedMapLayerAtom = atom((get) => {
    const layers = get(mapLayersAtom);
    const selectedId = get(selectedMapLayerIdAtom);

    const selectedLayer = layers.find(layer => layer.id === selectedId);

    return selectedLayer || layers[0];
});