import { useState, useEffect } from 'react'
import type { LatLngTuple } from '../types'
import { api } from '../api/api'

export function useRoute(source: LatLngTuple, target: LatLngTuple) {
    const [route, setRoute] = useState<LatLngTuple[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        api.fetchRoute(source, target)
            .then(data => {
                if (!cancelled) setRoute(data)
            })
            .catch(err => {
                if (!cancelled) {
                    const msg = err instanceof Error ? err.message : 'Fetch failed'
                    setError(msg)
                    setRoute([])
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [source, target])

    return { route, loading, error }
}
