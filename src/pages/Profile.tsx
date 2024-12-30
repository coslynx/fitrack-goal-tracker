import React, { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import apiService from '@/services/api'
import Card from '@/components/Card'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { User } from '@/types/types'
import { sanitizeInput } from '@/utils/helpers'

const Profile: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [firstNameError, setFirstNameError] = useState<string | null>(null)
    const [lastNameError, setLastNameError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const { user, isAuthenticated, setUser } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/')
        }
    }, [isAuthenticated, navigate, user])

    const handleOpenModal = useCallback(() => {
        setEditMode(true)
        setIsModalOpen(true)
        setFirstName(user?.firstName || '')
        setLastName(user?.lastName || '')
    }, [user])

    const handleCloseModal = useCallback(() => {
         setEditMode(false)
        setIsModalOpen(false)
        setFirstName('')
        setLastName('')
        setFirstNameError(null)
        setLastNameError(null)
    }, [])


    const validateForm = useCallback((): boolean => {
        let isValid = true
        setFirstNameError(null)
        setLastNameError(null)

        const sanitizedFirstName = sanitizeInput(firstName)
        const sanitizedLastName = sanitizeInput(lastName)

        if (!sanitizedFirstName) {
            setFirstNameError('First name is required')
            isValid = false
        }
        if (!sanitizedLastName) {
            setLastNameError('Last name is required')
            isValid = false
        }
        return isValid
    }, [firstName, lastName])

    const handleUpdateProfile = useCallback(async () => {
          if (!validateForm()) {
               return
           }

        setIsLoading(true)

        try {
           
           const sanitizedFirstName = sanitizeInput(firstName)
           const sanitizedLastName = sanitizeInput(lastName)


            const updatedUser = await apiService.put<User, { firstName: string; lastName: string }>(
                 '/api/auth/user',
                { firstName: sanitizedFirstName, lastName: sanitizedLastName },
            )

             if (updatedUser) {
                  setUser(updatedUser)
                  setEditMode(false)
             }

        } catch (error: any) {
            if (import.meta.env.MODE === 'development') {
                console.error('Error updating profile:', error)
            }
        } finally {
            setIsLoading(false)
             handleCloseModal()
        }
    }, [firstName, lastName, validateForm, setUser, handleCloseModal])


    if (!user) {
        return (
             <Layout>
                <div className="text-center">
                    <p className="text-xl font-semibold mb-4">
                        User session not found, redirecting to login.
                    </p>
                 </div>
           </Layout>
        )
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
                <Card>
                    <div className="mb-4">
                        <p>
                            <strong>Username:</strong> {user.username}
                        </p>
                        <p>
                            <strong>Email:</strong> {user.email}
                        </p>
                    </div>
                   <Button onClick={handleOpenModal} className="mt-4">
                     Edit Profile
                   </Button>
                </Card>
            

                <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                     <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                    <Input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        error={firstNameError}
                        required={true}
                    />
                    <Input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        error={lastNameError}
                        required={true}
                    />

                      {firstNameError && (
                        <p className="text-red-500 text-xs italic mb-4">{firstNameError}</p>
                    )}

                    {lastNameError && (
                         <p className="text-red-500 text-xs italic mb-4">{lastNameError}</p>
                    )}

                   <Button onClick={handleUpdateProfile} disabled={isLoading} className="mt-4">
                        {isLoading ? 'Loading...' : 'Update Profile'}
                   </Button>
                </Modal>
                  {isLoading && (
                        <div className="text-center mt-4">
                             <p>Updating profile...</p>
                       </div>
                  )}
            </div>
        </Layout>
    )
}

export default Profile