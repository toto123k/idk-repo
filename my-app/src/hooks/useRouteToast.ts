// hooks/useRouteToast.ts 
import { toast } from 'react-toastify'
import { useEffect, useRef } from 'react'

export const useRouteToast = (loading: boolean, error: string | null) => {
    const toastId = useRef<string | number | null>(null)
    const prevLoading = useRef<boolean>(false)

    useEffect(() => {
        // Only create new loading toast when loading starts (false -> true)
        if (loading && !prevLoading.current) {
            // Dismiss any existing toast first
            if (toastId.current != null) {
                toast.dismiss(toastId.current)
            }
            toastId.current = toast.loading('Loading route…')

        }
        // Update loading when it finishes (true -> false)
        else if (!loading && prevLoading.current && toastId.current != null) {
            if (error) {
                toast.update(toastId.current, {
                    render: `Route fetch error: ${error}`,
                    type: 'error',
                    isLoading: false,
                    autoClose: 5000,
                })
            } else {
                toast.update(toastId.current, {
                    render: 'Route loaded successfully',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000,
                })
            }
            toastId.current = null
        }

        // Update the previous loading state
        prevLoading.current = loading
    }, [loading, error])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (toastId.current != null) {
                toast.dismiss(toastId.current)
            }
        }
    }, [])
}