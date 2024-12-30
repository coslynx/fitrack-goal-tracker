import React, { useState, useCallback, useEffect, useMemo, Suspense, lazy } from 'react'
import Layout from '@/components/Layout'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

const AuthForm = lazy(() => import('@/components/AuthForm'))

const Home: React.FC = () => {
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard')
        }
    }, [isAuthenticated, navigate])


    const toggleAuthMode = useCallback(() => {
        setAuthMode((prevMode) => (prevMode === 'login' ? 'register' : 'login'))
    }, [])

    const handleAuthSuccess = useCallback(() => {
        navigate('/dashboard')
    }, [navigate])

    const authForm = useMemo(() => {
        return (
            <Suspense fallback={<div className="text-center">Loading authentication form...</div>}>
                <AuthForm type={authMode} onSuccess={handleAuthSuccess} />
            </Suspense>
        )
    }, [authMode, handleAuthSuccess])

    return (
        <Layout>
             <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                    {authMode === 'login' ? 'Login' : 'Register'}
                </h2>
               
                {isAuthenticated ? (
                     <div className="text-center">
                        <p className="text-xl font-semibold mb-4">You are already logged in.</p>
                     </div>
                ) : authForm }
                
                 {!isAuthenticated && (
                   <div className="text-center mt-4">
                      <button
                       className="text-blue-500 hover:text-blue-700 focus:outline-none"
                        onClick={toggleAuthMode}
                        tabIndex={0}
                       >
                        {authMode === 'login'
                            ? 'Need an account? Register here'
                            : 'Already have an account? Login here'}
                    </button>
                  </div>
               )}
           </div>
        </Layout>
    )
}

export default Home