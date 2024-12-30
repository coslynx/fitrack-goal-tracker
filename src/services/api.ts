import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { User, Goal } from '@/types/types'

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser) as User
            if (user && user.token && typeof user.token === 'string') {
                config.headers.Authorization = Bearer ${user.token}
            }
        } catch (error) {
            console.error('Error parsing user data or token from local storage', error)
        }
    }
    return config
})

const handleRequestError = (error: AxiosError): void => {
    if (error.response) {
        const { status, data } = error.response
        const errorMessage = Server error: ${status} - ${JSON.stringify(data)}
        if (import.meta.env.MODE === 'development') {
            console.error('API Request Error:', error)
        }
        throw new Error(errorMessage)
    } else if (error.request) {
        if (import.meta.env.MODE === 'development') {
            console.error('API Request Error:', error)
        }
        throw new Error('Network error: Could not connect to the server')
    } else {
         if (import.meta.env.MODE === 'development') {
            console.error('API Request Error:', error)
         }
        throw new Error(An unexpected error occurred: ${error.message})
    }
}

const apiService = {
    axios: api,

    async get<T>(url: string, params?: any): Promise<T> {
        try {
            const response: AxiosResponse<T> = await api.get(url, { params })
            return response.data
        } catch (error: any) {
            handleRequestError(error)
             throw error
        }
    },

    async post<T, U>(url: string, data: U): Promise<T> {
         try {
            if(typeof data === 'undefined'){
                  throw new Error('Request body is required for POST requests')
            }
           const response: AxiosResponse<T> = await api.post(url, data)
            return response.data
        } catch (error: any) {
            handleRequestError(error)
            throw error
        }
    },

    async put<T, U>(url: string, data: U): Promise<T> {
         try {
               if(typeof data === 'undefined'){
                  throw new Error('Request body is required for PUT requests')
                }
            const response: AxiosResponse<T> = await api.put(url, data)
            return response.data
        } catch (error: any) {
            handleRequestError(error)
            throw error
        }
    },


    async delete<T>(url: string): Promise<T> {
        try {
            const response: AxiosResponse<T> = await api.delete(url)
            return response.data
        } catch (error: any) {
            handleRequestError(error)
            throw error
        }
    },


    async login(credentials: { username: string; password: string }): Promise<{ token: string; user: any }> {
          try {
            const response = await this.post<{ token: string; user: any }, { username: string; password: string }>('/api/auth/login', credentials)
             return response
          } catch (error) {
              throw error
          }
    },

    async register(userData: { username: string; email: string; password: string }): Promise<{ token: string; user: any }> {
          try{
               const response = await this.post<{ token: string; user: any }, { username: string; email: string; password: string }>('/api/auth/register', userData)
               return response
          } catch (error) {
                throw error
          }
    },

    async getGoals(): Promise<Goal[]> {
        try {
            return await this.get<Goal[]>('/api/goals')
        } catch (error) {
            throw error
        }
    },

    async createGoal(goalData: Omit<Goal, 'id'>): Promise<Goal> {
        try {
              return await this.post<Goal, Omit<Goal, 'id'>>('/api/goals', goalData)
          } catch (error) {
                throw error
          }
    },


     async updateGoal(goalId: string, goalData:  Omit<Goal, 'id'>): Promise<Goal> {
         try {
             return await this.put<Goal, Omit<Goal, 'id'>>(/api/goals/${goalId}, goalData)
         } catch (error) {
             throw error
         }
     },

    async deleteGoal(goalId: string): Promise<Goal> {
        try {
            return await this.delete<Goal>(/api/goals/${goalId})
        } catch (error) {
             throw error
        }
    },
}


export default apiService