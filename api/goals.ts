import express, { Request, Response, Router } from 'express'
import { MongoClient, ServerApiVersion, Db, ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import { sanitizeInput } from '@/utils/helpers'

const router: Router = express.Router()
router.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET
const MONGODB_URI = process.env.VITE_MONGODB_URI

if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set.')
    process.exit(1)
}

if (!MONGODB_URI) {
    console.error('VITE_MONGODB_URI environment variable is not set.')
    process.exit(1)
}

const client = new MongoClient(MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

async function connectDB(): Promise<Db> {
    try {
        await client.connect()
        return client.db()
    } catch (error) {
        console.error('Failed to connect to the database:', error)
        throw new Error('Failed to connect to the database')
    }
}

const closeDB = async () => {
    try {
        await client.close()
    } catch (error) {
        console.error('Error closing database connection:', error)
    }
}

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

router.get('/api/goals', async (req: Request, res: Response) => {
    let db
    try {
        db = await connectDB()
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const token = authHeader.substring(7)
        let decodedToken
        try {
             decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string }
        } catch (jwtError: any) {
             return res.status(401).json({ error: 'Invalid token' })
        }

        if(!decodedToken || !decodedToken.userId) {
              return res.status(401).json({ error: 'Invalid token: missing user ID' });
        }
         const userId =  decodedToken.userId

         const sanitizedUserId = sanitizeInput(userId)

         if(!sanitizedUserId){
            return res.status(401).json({ error: 'Invalid user id' });
         }


        const goals = await db
            .collection('goals')
            .find({ userId: sanitizedUserId })
            .toArray()

        res.status(200).json(goals.map(goal => ({
               id: goal._id.toString(),
                name: goal.name,
                description: goal.description,
               userId: goal.userId,
                createdAt: goal.createdAt,
                updatedAt: goal.updatedAt
           })))
    } catch (error: any) {
        if (import.meta.env.MODE === 'development') {
             console.error('Error getting goals:', error)
        }
        return res.status(500).json({ error: 'Internal Server Error' })
    } finally {
        if (db) {
            await closeDB()
        }
    }
})

router.post('/api/goals', async (req: Request, res: Response) => {
    let db
    try {
        db = await connectDB()
        const authHeader = req.headers.authorization
           if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const token = authHeader.substring(7)
          let decodedToken
        try {
             decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string }
        } catch (jwtError: any) {
             return res.status(401).json({ error: 'Invalid token' })
        }

        if(!decodedToken || !decodedToken.userId) {
              return res.status(401).json({ error: 'Invalid token: missing user ID' });
        }
         const userId =  decodedToken.userId
          const sanitizedUserId = sanitizeInput(userId)
         if(!sanitizedUserId){
             return res.status(401).json({ error: 'Invalid user id' });
         }


        const { name, description } = req.body

        if (!name || !description) {
            return res.status(400).json({ error: 'Missing goal name or description' })
        }


        const sanitizedName = sanitizeInput(name)
        const sanitizedDescription = sanitizeInput(description)
       

        if(!sanitizedName || !sanitizedDescription){
            return res.status(400).json({ error: 'Invalid goal name or description' })
        }

        const newGoal = {
            name: sanitizedName,
            description: sanitizedDescription,
            userId: sanitizedUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const result = await db.collection('goals').insertOne(newGoal)

          const goal = {
                id: result.insertedId.toString(),
                 name: newGoal.name,
                description: newGoal.description,
                userId: newGoal.userId,
                createdAt: newGoal.createdAt,
                updatedAt: newGoal.updatedAt
           }

        res.status(201).json(goal)
    } catch (error: any) {
        if (import.meta.env.MODE === 'development') {
            console.error('Error creating goal:', error)
        }
        return res.status(500).json({ error: 'Internal Server Error' })
    } finally {
        if (db) {
            await closeDB()
        }
    }
})

router.put('/api/goals/:goalId', async (req: Request, res: Response) => {
    let db
    try {
        db = await connectDB()

        const authHeader = req.headers.authorization
           if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' })
        }
        const token = authHeader.substring(7)
          let decodedToken
        try {
              decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string }
        } catch (jwtError: any) {
            return res.status(401).json({ error: 'Invalid token' })
        }
        if(!decodedToken || !decodedToken.userId) {
              return res.status(401).json({ error: 'Invalid token: missing user ID' });
        }

         const userId =  decodedToken.userId
          const sanitizedUserId = sanitizeInput(userId)
         if(!sanitizedUserId){
             return res.status(401).json({ error: 'Invalid user id' });
         }

        const goalId = req.params.goalId

        if (!goalId) {
            return res.status(400).json({ error: 'Missing goal ID' })
        }

        if(!ObjectId.isValid(goalId)) {
              return res.status(400).json({ error: 'Invalid goal ID' })
        }
         
        const { name, description } = req.body

         if (!name || !description) {
            return res.status(400).json({ error: 'Missing goal name or description' })
        }

        const sanitizedName = sanitizeInput(name)
        const sanitizedDescription = sanitizeInput(description)

         if(!sanitizedName || !sanitizedDescription){
            return res.status(400).json({ error: 'Invalid goal name or description' })
        }

        const result = await db.collection('goals').findOneAndUpdate(
            { _id: new ObjectId(goalId), userId: sanitizedUserId },
            {
                $set: {
                    name: sanitizedName,
                    description: sanitizedDescription,
                    updatedAt: new Date(),
                },
            },
            { returnDocument: 'after' },
        )

         if (!result) {
            return res.status(404).json({ error: 'Goal not found' })
        }

         const goal = {
                id: result._id.toString(),
                name: result.name,
                description: result.description,
                userId: result.userId,
                 createdAt: result.createdAt,
                updatedAt: result.updatedAt
           }

        res.status(200).json(goal)
    } catch (error: any) {
        if (import.meta.env.MODE === 'development') {
            console.error('Error updating goal:', error)
        }
        return res.status(500).json({ error: 'Internal Server Error' })
    } finally {
        if (db) {
            await closeDB()
        }
    }
})

router.delete('/api/goals/:goalId', async (req: Request, res: Response) => {
    let db
    try {
        db = await connectDB()
         const authHeader = req.headers.authorization
           if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' })
        }
           const token = authHeader.substring(7)

          let decodedToken
        try {
              decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string }
        } catch (jwtError: any) {
              return res.status(401).json({ error: 'Invalid token' })
        }
        if(!decodedToken || !decodedToken.userId) {
             return res.status(401).json({ error: 'Invalid token: missing user ID' });
        }
          const userId =  decodedToken.userId
          const sanitizedUserId = sanitizeInput(userId)

         if(!sanitizedUserId){
             return res.status(401).json({ error: 'Invalid user id' });
         }

        const goalId = req.params.goalId

        if (!goalId) {
            return res.status(400).json({ error: 'Missing goal ID' })
        }
         if(!ObjectId.isValid(goalId)) {
            return res.status(400).json({ error: 'Invalid goal ID' })
         }

        const result = await db
            .collection('goals')
            .findOneAndDelete({ _id: new ObjectId(goalId), userId: sanitizedUserId })

         if (!result.value) {
            return res.status(404).json({ error: 'Goal not found' })
        }
           const goal = {
                id: result.value._id.toString(),
                name: result.value.name,
                 description: result.value.description,
                userId: result.value.userId,
                createdAt: result.value.createdAt,
               updatedAt: result.value.updatedAt
           }

        res.status(200).json(goal)
    } catch (error: any) {
        if (import.meta.env.MODE === 'development') {
            console.error('Error deleting goal:', error)
        }
        return res.status(500).json({ error: 'Internal Server Error' })
    } finally {
        if (db) {
            await closeDB()
        }
    }
})

export default router