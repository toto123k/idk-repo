import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { MyLocation, Flag } from '@mui/icons-material'
import type { LocationData } from '../../types/types'
import './MarkerIcon.css'

const COLORS = {
    source: { bg: '#1976d2', border: '#1565c0' },
    target: { bg: '#d32f2f', border: '#c62828' },
    waypoint: { bg: '#fbc02d', border: '#f57f17' }
}

interface MarkerIconProps extends Pick<LocationData, 'type'> {
    order?: number
}

export const MarkerIcon: React.FC<MarkerIconProps> = ({ type, order }) => {
    const { bg, border } = COLORS[type]
    const Icon = type === 'source' ? MyLocation : Flag


    return (
        <div className="marker-container">
            <div
                className="marker-icon-wrapper"
                style={{ backgroundColor: bg, borderColor: border }}
            >
                {
                    type !== "waypoint" ? <Icon /> :
                        <span className="waypoint-number">{order ?? '?'}</span>
                }
            </div>
            {type !== 'waypoint' && <span className="marker-label">{type}</span>}
        </div>
    )
}


export function renderMarkerIcon(data: Pick<LocationData, 'type' | 'order'>) {
    return ReactDOMServer.renderToString(<MarkerIcon type={data.type} order={data.order} />)
}

