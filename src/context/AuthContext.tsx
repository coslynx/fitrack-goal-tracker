import React, {
    createContext,
    useState,
    useContext,
    ReactNode,
    Dispatch,
    SetStateAction,
} from 'react'

interface User {
    id: string
    username: string
    email: string
    firstName: string
    lastName: string
    createdAt: Date
    updatedAt: Date
}

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    login: (user: User) => void
    logout: () => void
    setUser: Dispatch<SetStateAction<User | null>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthContextProviderProps {
    children: ReactNode
}

const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)

    const login = (user: User) => {
        setIsAuthenticated(true)
        setUser(user)
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('user', JSON.stringify(user))
    }

    const logout = () => {
        setIsAuthenticated(false)
        setUser(null)
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('user')
    }

    // Check local storage for existing session when context initializes
    React.useEffect(() => {
        const storedAuth = localStorage.getItem('isAuthenticated')
        const storedUser = localStorage.getItem('user')
    
        if (storedAuth === 'true' && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser) as User;
                setIsAuthenticated(true);
                setUser(parsedUser);
            } catch (error) {
                console.error('Failed to parse user data from local storage', error)
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user');
             }
         }
    }, []);

    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        setUser
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContextProvider')
    }
    return context
}

export { AuthContext, AuthContextProvider, useAuth }