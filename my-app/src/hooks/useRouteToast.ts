import { toast } from 'react-toastify'
import { useEffect, useRef } from 'react'

export const useRouteToast = (loading: boolean, error: string | null) => {
    const toastId = useRef<string | number | null>(null)
    const prevLoading = useRef<boolean>(false)

    useEffect(() => {
        if (loading && !prevLoading.current) {
            if (toastId.current != null) {
                toast.dismiss(toastId.current)
            }
            toastId.current = toast.loading('Loading route…')

        }
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
                    autoClose: 1000,
                })
            }
            toastId.current = null
        }

        prevLoading.current = loading
    }, [loading, error])

    useEffect(() => {
        return () => {
            if (toastId.current != null) {
                toast.dismiss(toastId.current)
            }
        }
    }, [])
}