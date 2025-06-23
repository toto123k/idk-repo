import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson'
import type { LatLngLiteral } from 'leaflet'

function getPolygons(
    geom: Polygon | MultiPolygon
): Polygon['coordinates'][] {
    return geom.type === 'Polygon'
        ? [geom.coordinates]
        : geom.coordinates
}

export function extractAvoidZones(
    fc: FeatureCollection,
): LatLngLiteral[][] {
    return fc.features.flatMap(({ geometry }) => {
        if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
            return []
        }
        return getPolygons(geometry).map(ring =>
            ring[0].map(([lng, lat]) => ({ lat, lng }))
        )
    })
}