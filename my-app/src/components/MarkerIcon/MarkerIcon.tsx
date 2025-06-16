import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { MyLocation, Flag } from '@mui/icons-material'
import type { LocationData } from '../../types/types'
import './MarkerIcon.css'

const COLORS = {
    source: { bg: '#1976d2', border: '#1565c0' },
    target: { bg: '#d32f2f', border: '#c62828' },
}

export const MarkerIcon: React.FC<Pick<LocationData, 'type'>> = ({ type }) => {
    const { bg, border } = COLORS[type]
    const Icon = type === 'source' ? MyLocation : Flag

    return (
        <div className="marker-container">
            <div
                className="marker-icon-wrapper"
                style={{ backgroundColor: bg, borderColor: border }}
            >
                <Icon className="marker-icon" />
            </div>
            <span className="marker-label">{type}</span>
        </div>
    )
}

export function renderMarkerIcon(data: Pick<LocationData, 'type'>) {
    return ReactDOMServer.renderToString(<MarkerIcon type={data.type} />)
}
