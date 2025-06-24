import 'leaflet';

declare module 'leaflet' {

    interface PathOptions {
        zoneId?: string;
    }
}