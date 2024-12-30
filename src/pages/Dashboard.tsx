import React, { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import useFetch from '@/hooks/useFetch'
import Card from '@/components/Card'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import Input from '@/components/Input'
import apiService from '@/services/api'
import { User, Goal } from '@/types/types'
import { sanitizeInput } from '@/utils/helpers'

const Dashboard: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newGoalName, setNewGoalName] = useState('')
    const [newGoalDescription, setNewGoalDescription] = useState('')
    const [newGoalError, setNewGoalError] = useState<string | null>(null)
    const [editGoalId, setEditGoalId] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/')
        }
    }, [isAuthenticated, navigate, user])

    const {
        data: goals,
        loading,
        error,
        fetchData,
    } = useFetch<Goal[]>('/api/goals')

    const handleOpenModal = useCallback(() => {
        setIsModalOpen(true)
        setNewGoalName('')
        setNewGoalDescription('')
        setNewGoalError(null)
        setEditGoalId(null)
    }, [])

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false)
        setNewGoalName('')
        setNewGoalDescription('')
        setNewGoalError(null)
        setEditGoalId(null)
    }, [])
    
    const handleOpenEditModal = useCallback((goal: Goal) => {
        setIsModalOpen(true)
        setNewGoalName(goal.name)
        setNewGoalDescription(goal.description)
        setNewGoalError(null)
        setEditGoalId(goal.id);
    }, []);


    const handleCreateGoal = useCallback(async () => {
        setNewGoalError(null)

        const sanitizedName = sanitizeInput(newGoalName)
        const sanitizedDescription = sanitizeInput(newGoalDescription)

        if (!sanitizedName) {
            setNewGoalError('Goal name is required')
            return
        }
        if(!sanitizedDescription){
            setNewGoalError('Goal description is required')
            return
        }


        try {
             if(editGoalId) {
                   await apiService.updateGoal(editGoalId, {
                      name: sanitizedName,
                      description: sanitizedDescription,
                   })
             }else{
                  await apiService.createGoal({
                    name: sanitizedName,
                    description: sanitizedDescription,
                })
             }
           
            fetchData()
            handleCloseModal()
        } catch (err: any) {
            if (import.meta.env.MODE === 'development') {
                console.error('Error creating/updating goal:', err)
            }
            setNewGoalError(err.message || 'Failed to create/update goal')
        }
    }, [newGoalName, newGoalDescription, fetchData, handleCloseModal, editGoalId])


    const handleDeleteGoal = useCallback(async (goalId: string) => {
        try {
            await apiService.deleteGoal(goalId)
            fetchData()
        } catch (err: any) {
            if (import.meta.env.MODE === 'development') {
                  console.error('Error deleting goal:', err)
              }
           
        }
    }, [fetchData])


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
    if (loading) {
        return (
             <Layout>
                <div className="text-center">
                     <p className="text-xl font-semibold mb-4">Loading goals...</p>
                </div>
           </Layout>
        )
    }

    if (error) {
        return (
           <Layout>
                 <div className="text-center">
                    <p className="text-red-500 text-xl font-semibold mb-4">
                        Error loading goals: {error}
                    </p>
                 </div>
          </Layout>
        )
    }
    
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-semibold mb-4">
                    Welcome, {user.username}!
                </h2>
                  <div className="mb-4">
                    <Button onClick={handleOpenModal}>Add New Goal</Button>
                </div>
                {goals && goals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {goals.map((goal) => (
                            <Card key={goal.id}>
                                <h3 className="text-xl font-semibold mb-2">{goal.name}</h3>
                                <p className="text-gray-700 mb-4">{goal.description}</p>
                                <div className="flex justify-end gap-2">
                                  <Button onClick={() => handleOpenEditModal(goal)} className="bg-yellow-500 hover:bg-yellow-700">Edit</Button>
                                   <Button onClick={() => handleDeleteGoal(goal.id)} className="bg-red-500 hover:bg-red-700">Delete</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p>No goals have been created yet.</p>
                )}
                <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                    <h2 className="text-xl font-semibold mb-4">
                    {editGoalId ? 'Edit Goal' : 'Add New Goal'}
                    </h2>
                    <Input
                        type="text"
                        placeholder="Goal Name"
                        value={newGoalName}
                        onChange={(e) => setNewGoalName(e.target.value)}
                        error={newGoalError}
                        required={true}
                    />
                       <Input
                        type="text"
                        placeholder="Goal Description"
                        value={newGoalDescription}
                        onChange={(e) => setNewGoalDescription(e.target.value)}
                        error={newGoalError}
                        required={true}
                    />
                    {newGoalError && (
                        <p className="text-red-500 text-xs italic mb-4">{newGoalError}</p>
                    )}
                     <Button onClick={handleCreateGoal} className="mt-4">
                      {editGoalId ? 'Update Goal' : 'Create Goal'}
                     </Button>
                </Modal>
            </div>
        </Layout>
    )
}

export default Dashboard