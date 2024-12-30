import React, { useState, useCallback } from 'react'
import Input from '@/components/Input'
import Button from '@/components/Button'
import apiService from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail, sanitizeInput } from '@/utils/helpers'

interface AuthFormProps {
    type: 'login' | 'register'
    onSuccess: () => void
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess }) => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [usernameError, setUsernameError] = useState<string | null>(null)
    const [emailError, setEmailError] = useState<string | null>(null)
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()

    const validateForm = useCallback((): boolean => {
        let isValid = true
        setUsernameError(null)
        setEmailError(null)
        setPasswordError(null)

        if (!sanitizeInput(username)) {
            setUsernameError('Username is required')
            isValid = false
        }
    
        if (type === 'register' && !sanitizeInput(email)) {
            setEmailError('Email is required')
             isValid = false
        } else if(type === 'register' && !validateEmail(sanitizeInput(email))) {
               setEmailError('Invalid email format')
               isValid = false
        }

        if (!sanitizeInput(password)) {
            setPasswordError('Password is required')
            isValid = false
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters')
            isValid = false
        }


        return isValid
    }, [username, email, password, type])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        
          if (!validateForm()) {
            return
          }

        setIsLoading(true)

        try {
            let response
             const sanitizedUsername = sanitizeInput(username)
             const sanitizedPassword = sanitizeInput(password)
             const sanitizedEmail = sanitizeInput(email)

            if (type === 'login') {
               response = await apiService.login({
                  username: sanitizedUsername,
                    password: sanitizedPassword,
                })
                
             } else {
                 response = await apiService.register({
                     username: sanitizedUsername,
                     email: sanitizedEmail,
                      password: sanitizedPassword,
                 })
             }
           
            if (response && response.user) {
                login(response.user)
                onSuccess()
            } else {
              console.error('Invalid response from the API:', response)
            }
        } catch (error:any) {
             console.error('Error during authentication:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const isFormValid = useMemo(() => {
         return validateForm()
    },[validateForm])

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={true}
                error={usernameError}
            />
            {type === 'register' && (
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={true}
                    error={emailError}
                />
            )}
            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={true}
                error={passwordError}
            />
            <Button type="submit" disabled={isLoading || !isFormValid} className="mt-4">
                {isLoading ? 'Loading...' : type === 'login' ? 'Login' : 'Register'}
            </Button>
        </form>
    )
}

export default AuthForm