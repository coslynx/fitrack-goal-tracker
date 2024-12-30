import { useState, useEffect, useCallback } from 'react'
import axios, { AxiosError, AxiosResponse } from 'axios'

interface UseFetchResult<T> {
    data: T | null
    loading: boolean
    error: string | null
}

function useFetch<T>(url: string | null): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        if (!url) {
            setError('URL cannot be empty or null')
            return
        }
    
        if (typeof url !== 'string'){
            setError('URL must be a string')
            return;
        }
       
        setLoading(true)
        setError(null)

        try {
            const response: AxiosResponse<T> = await axios.get(url)
            setData(response.data)
        } catch (e) {
            const axiosError = e as AxiosError
            if (axiosError.response) {
                setError(Server error: ${axiosError.response.status} - ${axiosError.response.data})
            } else if (axiosError.request) {
                setError('Network error: Could not connect to the server')
            } else {
                setError(An unexpected error occurred: ${axiosError.message})
                
            }
            setData(null)

        } finally {
            setLoading(false)
        }
    }, [url])

    useEffect(() => {
        if (url) {
           fetchData()
        }
    }, [url, fetchData])

    return { data, loading, error }
}

export default useFetch