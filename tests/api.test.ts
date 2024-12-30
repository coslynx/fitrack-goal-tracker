import axios from 'axios'
import jwt from 'jsonwebtoken'
import { sanitizeInput } from '@/utils/helpers'

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000'
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

const generateMockToken = (userId: string): string => {
    return jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '1h' })
}

describe('API Endpoints', () => {
    if (import.meta.env.MODE === 'development') {
        console.log('Running API tests in development mode.')
    }

    describe('Authentication Endpoints', () => {
        it('should successfully register a new user', async () => {
            const username = 'testuser'
            const email = 'test@example.com'
            const password = 'password123'

            const response = await axios.post(${API_BASE_URL}/api/auth/register, {
                username: sanitizeInput(username),
                email: sanitizeInput(email),
                password: sanitizeInput(password),
            })

            expect(response.status).toBe(201)
            expect(response.data).toHaveProperty('token')
            expect(response.data).toHaveProperty('user')
            expect(response.data.user).toHaveProperty('id')
            expect(response.data.user).toHaveProperty('username', username)
            expect(response.data.user).toHaveProperty('email', email)
            expect(response.data.user).toHaveProperty('firstName', '')
            expect(response.data.user).toHaveProperty('lastName', '')
            expect(response.data.user).toHaveProperty('createdAt')
            expect(response.data.user).toHaveProperty('updatedAt')


            if (import.meta.env.MODE === 'development') {
                console.log('Registration test passed:', response.data)
            }
        }, 10000)

        it('should fail to register a user with missing fields', async () => {
            try {
                await axios.post(${API_BASE_URL}/api/auth/register, {
                    username: 'testuser',
                    email: 'test@example.com',
                })
            } catch (error: any) {
                expect(error.response.status).toBe(400)
                expect(error.response.data).toEqual({ error: 'Missing required fields' })
                   if (import.meta.env.MODE === 'development') {
                       console.log('Registration with missing fields test passed:', error.response.data)
                }
            }
        }, 10000)
        it('should fail to register a user with invalid input values', async () => {
            try {
                await axios.post(${API_BASE_URL}/api/auth/register, {
                    username: 'test<user>',
                    email: 'test@<example>.com',
                      password:'password123'
                })
            } catch (error: any) {
               expect(error.response.status).toBe(400)
                expect(error.response.data).toEqual({ error: 'Invalid input values' })
                  if (import.meta.env.MODE === 'development') {
                        console.log('Registration with invalid input test passed:', error.response.data)
                    }
            }
        }, 10000)

        it('should fail to register a user with short password', async () => {
            try {
                await axios.post(${API_BASE_URL}/api/auth/register, {
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'pass',
                })
            } catch (error: any) {
                expect(error.response.status).toBe(400)
                expect(error.response.data).toEqual({
                    error: 'Password must be at least 6 characters',
                })
                if (import.meta.env.MODE === 'development') {
                    console.log('Registration with short password test passed:', error.response.data)
                 }
            }
        }, 10000)

        it('should successfully login an existing user', async () => {
             const username = 'testuser'
             const email = 'test@example.com'
              const password = 'password123'

              await axios.post(${API_BASE_URL}/api/auth/register, {
                username: sanitizeInput(username),
                email: sanitizeInput(email),
                password: sanitizeInput(password),
             })

            const response = await axios.post(${API_BASE_URL}/api/auth/login, {
                 username: sanitizeInput(username),
                password: sanitizeInput(password),
            })

            expect(response.status).toBe(200)
            expect(response.data).toHaveProperty('token')
            expect(response.data).toHaveProperty('user')
            expect(response.data.user).toHaveProperty('id')
             expect(response.data.user).toHaveProperty('username', username)
            expect(response.data.user).toHaveProperty('email', email)
             expect(response.data.user).toHaveProperty('firstName', '')
            expect(response.data.user).toHaveProperty('lastName', '')
            expect(response.data.user).toHaveProperty('createdAt')
            expect(response.data.user).toHaveProperty('updatedAt')
                if (import.meta.env.MODE === 'development') {
                console.log('Login test passed:', response.data)
            }
        }, 10000)

        it('should fail to login with invalid credentials', async () => {
              const username = 'testuser'
            const password = 'wrongpassword'
            try {
                await axios.post(${API_BASE_URL}/api/auth/login, {
                   username: sanitizeInput(username),
                    password: sanitizeInput(password),
                })
            } catch (error: any) {
                expect(error.response.status).toBe(401)
                expect(error.response.data).toEqual({
                    error: 'Invalid username or password',
                })
                   if (import.meta.env.MODE === 'development') {
                      console.log('Login with invalid credentials test passed:', error.response.data)
                 }
            }
        }, 10000)
         it('should fail to login with missing credentials', async () => {
             try {
                await axios.post(${API_BASE_URL}/api/auth/login, {
                    username: 'testuser',
                })
            } catch (error: any) {
                expect(error.response.status).toBe(400)
                 expect(error.response.data).toEqual({ error: 'Missing username or password' })
                    if (import.meta.env.MODE === 'development') {
                      console.log('Login with missing credentials test passed:', error.response.data)
                 }
            }
        }, 10000)
          it('should fail to login with invalid input values', async () => {
            try {
                await axios.post(${API_BASE_URL}/api/auth/login, {
                     username: 'test<user>',
                     password:'password123'
                })
            } catch (error: any) {
                 expect(error.response.status).toBe(400)
                 expect(error.response.data).toEqual({ error: 'Invalid input values' })
                  if (import.meta.env.MODE === 'development') {
                      console.log('Login with invalid input test passed:', error.response.data)
                 }
            }
        }, 10000)

        it('should successfully update user profile', async () => {
            const username = 'testuser'
             const email = 'test@example.com'
              const password = 'password123'

              const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                username: sanitizeInput(username),
                email: sanitizeInput(email),
                password: sanitizeInput(password),
             })
             const token = registerResponse.data.token
            const firstName = 'Test'
            const lastName = 'User'
           const response = await axios.put(
                ${API_BASE_URL}/api/auth/user,
                { firstName: sanitizeInput(firstName), lastName: sanitizeInput(lastName) },
                 { headers: { Authorization: Bearer ${token} } },
            )

            expect(response.status).toBe(200)
             expect(response.data).toHaveProperty('id')
             expect(response.data).toHaveProperty('username', username)
            expect(response.data).toHaveProperty('email', email)
            expect(response.data).toHaveProperty('firstName', firstName)
             expect(response.data).toHaveProperty('lastName', lastName)
             expect(response.data).toHaveProperty('createdAt')
             expect(response.data).toHaveProperty('updatedAt')

             if (import.meta.env.MODE === 'development') {
                console.log('Update profile test passed:', response.data)
            }
        }, 10000)

           it('should fail to update user profile with missing names', async () => {
                const username = 'testuser'
                const email = 'test@example.com'
              const password = 'password123'
              const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                username: sanitizeInput(username),
                email: sanitizeInput(email),
                password: sanitizeInput(password),
              })
                const token = registerResponse.data.token
               try {
                   await axios.put(
                    ${API_BASE_URL}/api/auth/user,
                    { },
                       { headers: { Authorization: Bearer ${token} } },
                 )
               } catch (error:any) {
                expect(error.response.status).toBe(400)
                expect(error.response.data).toEqual({ error: 'Missing first or last name' })
                   if (import.meta.env.MODE === 'development') {
                     console.log('Update profile with missing names test passed:', error.response.data)
                 }
               }
        }, 10000)
         it('should fail to update user profile with invalid names', async () => {
                 const username = 'testuser'
                const email = 'test@example.com'
              const password = 'password123'
              const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                username: sanitizeInput(username),
                email: sanitizeInput(email),
                password: sanitizeInput(password),
              })
                 const token = registerResponse.data.token
              try {
                await axios.put(
                    ${API_BASE_URL}/api/auth/user,
                    { firstName:'Test<', lastName: 'User>' },
                     { headers: { Authorization: Bearer ${token} } },
                )
              } catch (error: any) {
                   expect(error.response.status).toBe(400)
                    expect(error.response.data).toEqual({ error: 'Invalid first or last name' })
                      if (import.meta.env.MODE === 'development') {
                        console.log('Update profile with invalid names test passed:', error.response.data)
                   }
               }
         }, 10000)

        it('should fail to update user profile with invalid token', async () => {
            try {
                await axios.put(
                    ${API_BASE_URL}/api/auth/user,
                    { firstName: 'Test', lastName: 'User' },
                    { headers: { Authorization: 'Bearer invalid-token' } },
                )
            } catch (error: any) {
                expect(error.response.status).toBe(401)
                expect(error.response.data).toEqual({ error: 'Unauthorized' })
                 if (import.meta.env.MODE === 'development') {
                    console.log('Update profile with invalid token test passed:', error.response.data)
                 }
            }
        }, 10000)
         it('should fail to update user profile with missing token', async () => {
             try {
                   await axios.put(
                    ${API_BASE_URL}/api/auth/user,
                    { firstName: 'Test', lastName: 'User' },
                  )
               } catch (error: any) {
                   expect(error.response.status).toBe(401)
                    expect(error.response.data).toEqual({ error: 'Unauthorized' })
                      if (import.meta.env.MODE === 'development') {
                        console.log('Update profile with missing token test passed:', error.response.data)
                     }
               }
         }, 10000)
    })

    describe('Goals Endpoints', () => {
        it('should successfully create a new goal', async () => {
            const username = 'testuser'
            const email = 'test@example.com'
            const password = 'password123'
            const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
               username: sanitizeInput(username),
                email: sanitizeInput(email),
                password: sanitizeInput(password),
            })
             const token = registerResponse.data.token
            const name = 'Test Goal'
            const description = 'This is a test goal'

            const response = await axios.post(
                ${API_BASE_URL}/api/goals,
                {
                    name: sanitizeInput(name),
                    description: sanitizeInput(description),
                },
                { headers: { Authorization: Bearer ${token} } },
            )

            expect(response.status).toBe(201)
            expect(response.data).toHaveProperty('id')
            expect(response.data).toHaveProperty('name', name)
            expect(response.data).toHaveProperty('description', description)
             expect(response.data).toHaveProperty('userId')
            expect(response.data).toHaveProperty('createdAt')
            expect(response.data).toHaveProperty('updatedAt')
               if (import.meta.env.MODE === 'development') {
                 console.log('Create goal test passed:', response.data)
               }
        }, 10000)

          it('should fail to create a new goal with missing fields', async () => {
                const username = 'testuser'
                const email = 'test@example.com'
               const password = 'password123'

              const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                username: sanitizeInput(username),
                email: sanitizeInput(email),
                 password: sanitizeInput(password),
               })
                  const token = registerResponse.data.token
            try {
                await axios.post(
                    ${API_BASE_URL}/api/goals,
                    { name: 'Test Goal' },
                    { headers: { Authorization: Bearer ${token} } },
                )
            } catch (error: any) {
                expect(error.response.status).toBe(400)
                expect(error.response.data).toEqual({
                    error: 'Missing goal name or description',
                })
                if (import.meta.env.MODE === 'development') {
                  console.log('Create goal with missing fields test passed:', error.response.data)
                }
            }
        }, 10000)
        it('should fail to create a new goal with invalid input values', async () => {
              const username = 'testuser'
             const email = 'test@example.com'
              const password = 'password123'

              const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                  username: sanitizeInput(username),
                email: sanitizeInput(email),
                password: sanitizeInput(password),
             })
                 const token = registerResponse.data.token
             try {
                await axios.post(
                    ${API_BASE_URL}/api/goals,
                    { name: 'Test<Goal>', description: 'This is a <test> goal' },
                    { headers: { Authorization: Bearer ${token} } },
                )
            } catch (error: any) {
                expect(error.response.status).toBe(400)
                expect(error.response.data).toEqual({
                    error: 'Invalid goal name or description',
                })
                  if (import.meta.env.MODE === 'development') {
                      console.log('Create goal with invalid input test passed:', error.response.data)
                   }
            }
        }, 10000)

        it('should successfully retrieve goals', async () => {
            const username = 'testuser'
            const email = 'test@example.com'
            const password = 'password123'
            const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                 username: sanitizeInput(username),
                email: sanitizeInput(email),
                password: sanitizeInput(password),
            })
              const token = registerResponse.data.token
            await axios.post(
                ${API_BASE_URL}/api/goals,
                {
                    name: 'Test Goal 1',
                    description: 'This is test goal 1',
                },
                { headers: { Authorization: Bearer ${token} } },
            )
            await axios.post(
                ${API_BASE_URL}/api/goals,
                {
                    name: 'Test Goal 2',
                    description: 'This is test goal 2',
                },
                { headers: { Authorization: Bearer ${token} } },
            )

            const response = await axios.get(${API_BASE_URL}/api/goals, {
                headers: { Authorization: Bearer ${token} },
            })

            expect(response.status).toBe(200)
            expect(Array.isArray(response.data)).toBe(true)
            expect(response.data.length).toBeGreaterThanOrEqual(2)
              response.data.forEach((goal: any) => {
                  expect(goal).toHaveProperty('id');
                  expect(goal).toHaveProperty('name');
                 expect(goal).toHaveProperty('description');
                  expect(goal).toHaveProperty('userId');
                 expect(goal).toHaveProperty('createdAt');
                  expect(goal).toHaveProperty('updatedAt');
               });
              if (import.meta.env.MODE === 'development') {
                console.log('Retrieve goals test passed:', response.data)
             }
        }, 10000)

         it('should fail to retrieve goals with invalid token', async () => {
            try {
                await axios.get(${API_BASE_URL}/api/goals, {
                    headers: { Authorization: 'Bearer invalid-token' },
                })
            } catch (error: any) {
                expect(error.response.status).toBe(401)
                 expect(error.response.data).toEqual({ error: 'Invalid token' })
                 if (import.meta.env.MODE === 'development') {
                    console.log('Retrieve goals with invalid token test passed:', error.response.data)
                  }
            }
        }, 10000)
           it('should fail to retrieve goals with missing token', async () => {
              try {
                await axios.get(${API_BASE_URL}/api/goals)
              } catch (error: any) {
                   expect(error.response.status).toBe(401)
                    expect(error.response.data).toEqual({ error: 'Unauthorized' })
                      if (import.meta.env.MODE === 'development') {
                         console.log('Retrieve goals with missing token test passed:', error.response.data)
                      }
              }
         }, 10000)

          it('should successfully update an existing goal', async () => {
            const username = 'testuser'
            const email = 'test@example.com'
            const password = 'password123'
              const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
               username: sanitizeInput(username),
                email: sanitizeInput(email),
                 password: sanitizeInput(password),
             })
                  const token = registerResponse.data.token

            const createGoalResponse = await axios.post(
                ${API_BASE_URL}/api/goals,
                {
                    name: 'Test Goal',
                    description: 'This is a test goal',
                },
                { headers: { Authorization: Bearer ${token} } },
            )
                const goalId = createGoalResponse.data.id
            const updatedName = 'Updated Goal Name'
            const updatedDescription = 'This is an updated test goal'

            const response = await axios.put(
                ${API_BASE_URL}/api/goals/${goalId},
                {
                    name: sanitizeInput(updatedName),
                    description: sanitizeInput(updatedDescription),
                },
                { headers: { Authorization: Bearer ${token} } },
            )

            expect(response.status).toBe(200)
            expect(response.data).toHaveProperty('id', goalId)
            expect(response.data).toHaveProperty('name', updatedName)
            expect(response.data).toHaveProperty('description', updatedDescription)
               expect(response.data).toHaveProperty('userId')
            expect(response.data).toHaveProperty('createdAt')
             expect(response.data).toHaveProperty('updatedAt')
               if (import.meta.env.MODE === 'development') {
                   console.log('Update goal test passed:', response.data)
                 }
        }, 10000)
        it('should fail to update a goal with invalid goalId', async () => {
             const username = 'testuser'
            const email = 'test@example.com'
            const password = 'password123'
              const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                 username: sanitizeInput(username),
                email: sanitizeInput(email),
                  password: sanitizeInput(password),
              })
                  const token = registerResponse.data.token
             try {
                await axios.put(
                    ${API_BASE_URL}/api/goals/invalid-goal-id,
                    { name: 'Updated Goal', description: 'Updated description' },
                    { headers: { Authorization: Bearer ${token} } },
                 )
            } catch (error: any) {
                expect(error.response.status).toBe(400)
               expect(error.response.data).toEqual({ error: 'Invalid goal ID' })
                  if (import.meta.env.MODE === 'development') {
                       console.log('Update goal with invalid ID test passed:', error.response.data)
                  }
             }
        }, 10000)

        it('should fail to update a goal with missing fields', async () => {
              const username = 'testuser'
              const email = 'test@example.com'
             const password = 'password123'

            const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                username: sanitizeInput(username),
                 email: sanitizeInput(email),
                 password: sanitizeInput(password),
            })
             const token = registerResponse.data.token

            const createGoalResponse = await axios.post(
                ${API_BASE_URL}/api/goals,
                {
                    name: 'Test Goal',
                    description: 'This is a test goal',
                },
                { headers: { Authorization: Bearer ${token} } },
            )
                const goalId = createGoalResponse.data.id
             try {
                 await axios.put(
                    ${API_BASE_URL}/api/goals/${goalId},
                    { name: 'Updated Goal' },
                    { headers: { Authorization: Bearer ${token} } },
                 )
               } catch (error: any) {
                   expect(error.response.status).toBe(400)
                    expect(error.response.data).toEqual({
                        error: 'Missing goal name or description',
                    })
                      if (import.meta.env.MODE === 'development') {
                         console.log('Update goal with missing fields test passed:', error.response.data)
                      }
               }
        }, 10000)
          it('should fail to update a goal with invalid input values', async () => {
            const username = 'testuser'
              const email = 'test@example.com'
            const password = 'password123'
              const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                 username: sanitizeInput(username),
                  email: sanitizeInput(email),
                  password: sanitizeInput(password),
               })
                   const token = registerResponse.data.token
            const createGoalResponse = await axios.post(
                ${API_BASE_URL}/api/goals,
                {
                    name: 'Test Goal',
                    description: 'This is a test goal',
                },
                { headers: { Authorization: Bearer ${token} } },
            )
            const goalId = createGoalResponse.data.id
           try {
                await axios.put(
                    ${API_BASE_URL}/api/goals/${goalId},
                    { name: 'Updated<Goal>', description: 'This is a<test> goal' },
                    { headers: { Authorization: Bearer ${token} } },
                )
            } catch (error: any) {
               expect(error.response.status).toBe(400)
                expect(error.response.data).toEqual({
                    error: 'Invalid goal name or description',
                })
                   if (import.meta.env.MODE === 'development') {
                      console.log('Update goal with invalid input test passed:', error.response.data)
                  }
            }
        }, 10000)

         it('should successfully delete a goal', async () => {
              const username = 'testuser'
            const email = 'test@example.com'
             const password = 'password123'
              const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                username: sanitizeInput(username),
                 email: sanitizeInput(email),
                 password: sanitizeInput(password),
              })
                const token = registerResponse.data.token
            const createGoalResponse = await axios.post(
                ${API_BASE_URL}/api/goals,
                {
                    name: 'Test Goal',
                    description: 'This is a test goal',
                },
                { headers: { Authorization: Bearer ${token} } },
            )
            const goalId = createGoalResponse.data.id

            const response = await axios.delete(${API_BASE_URL}/api/goals/${goalId}, {
                headers: { Authorization: Bearer ${token} },
            })

             expect(response.status).toBe(200)
             expect(response.data).toHaveProperty('id', goalId)
              expect(response.data).toHaveProperty('name')
             expect(response.data).toHaveProperty('description')
               expect(response.data).toHaveProperty('userId')
            expect(response.data).toHaveProperty('createdAt')
             expect(response.data).toHaveProperty('updatedAt')
                if (import.meta.env.MODE === 'development') {
                   console.log('Delete goal test passed:', response.data)
                 }
        }, 10000)

        it('should fail to delete a goal with invalid goalId', async () => {
            const username = 'testuser'
            const email = 'test@example.com'
             const password = 'password123'
             const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                username: sanitizeInput(username),
                 email: sanitizeInput(email),
                 password: sanitizeInput(password),
            })
                const token = registerResponse.data.token
             try {
                await axios.delete(${API_BASE_URL}/api/goals/invalid-goal-id, {
                    headers: { Authorization: Bearer ${token} },
                })
            } catch (error: any) {
                expect(error.response.status).toBe(400)
                 expect(error.response.data).toEqual({ error: 'Invalid goal ID' })
                  if (import.meta.env.MODE === 'development') {
                      console.log('Delete goal with invalid ID test passed:', error.response.data)
                  }
            }
        }, 10000)
        it('should fail to delete a goal with missing goalId', async () => {
                const username = 'testuser'
                const email = 'test@example.com'
                const password = 'password123'
             const registerResponse = await axios.post(${API_BASE_URL}/api/auth/register, {
                  username: sanitizeInput(username),
                email: sanitizeInput(email),
                password: sanitizeInput(password),
               })
                     const token = registerResponse.data.token
            try {
                 await axios.delete(${API_BASE_URL}/api/goals/,{
                       headers: { Authorization: Bearer ${token} },
                 })
            } catch (error: any) {
                expect(error.response.status).toBe(404)
                 if (import.meta.env.MODE === 'development') {
                     console.log('Delete goal with missing ID test passed:', error)
                   }
            }
        }, 10000)
    })
})