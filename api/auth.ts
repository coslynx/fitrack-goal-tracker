import express, { Request, Response, Router } from 'express'
import { MongoClient, ServerApiVersion, Db } from 'mongodb'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
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
         console.error('Failed to connect to the database:', error);
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

router.post('/api/auth/register', async (req: Request, res: Response) => {
    let db
    try {
        db = await connectDB()

        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' })
        }
           const sanitizedUsername = sanitizeInput(username)
           const sanitizedEmail = sanitizeInput(email)
           const sanitizedPassword = sanitizeInput(password)

        if (!sanitizedUsername || !sanitizedEmail || !sanitizedPassword) {
            return res.status(400).json({ error: 'Invalid input values' })
        }


        if (sanitizedPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' })
        }
       
        const existingUser = await db.collection('users').findOne({
            $or: [{ username: sanitizedUsername }, { email: sanitizedEmail }],
        })

        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' })
        }

        const hashedPassword = await bcrypt.hash(sanitizedPassword, 10)
        const newUser = {
            username: sanitizedUsername,
            email: sanitizedEmail,
            password: hashedPassword,
            firstName: '',
            lastName: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const result = await db.collection('users').insertOne(newUser)

        const user = {
            id: result.insertedId.toString(),
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        }

        const token = jwt.sign({ userId: result.insertedId }, JWT_SECRET, {
            expiresIn: '1h',
        })

        res.status(201).json({ token, user })
    } catch (error: any) {
        if (import.meta.env.MODE === 'development') {
              console.error('Error registering user:', error)
        }
       
       return res.status(500).json({ error: 'Internal Server Error' })
    }finally {
          if (db) {
            await closeDB()
        }
    }
})

router.post('/api/auth/login', async (req: Request, res: Response) => {
    let db
    try {
         db = await connectDB()
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' })
        }

        const sanitizedUsername = sanitizeInput(username)
        const sanitizedPassword = sanitizeInput(password)

       if (!sanitizedUsername || !sanitizedPassword) {
           return res.status(400).json({ error: 'Invalid input values' })
        }


        const user = await db.collection('users').findOne({ username: sanitizedUsername })

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' })
        }

        const passwordMatch = await bcrypt.compare(sanitizedPassword, user.password)

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' })
        }

         const userResponse = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            firstName: user.firstName,
             lastName: user.lastName,
              createdAt: user.createdAt,
             updatedAt: user.updatedAt,
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: '1h',
        })
        res.status(200).json({ token, user:userResponse })
    } catch (error: any) {
        if (import.meta.env.MODE === 'development') {
             console.error('Error logging in user:', error)
         }
         return res.status(500).json({ error: 'Internal Server Error' })
    }finally {
         if (db) {
            await closeDB()
        }
    }
})


router.put('/api/auth/user', async (req: Request, res: Response) => {
    let db
    try {
        db = await connectDB()
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
             return res.status(401).json({ error: 'Unauthorized' })
         }
        const token = authHeader.substring(7)


        const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string }
        const userId = decodedToken.userId

        const { firstName, lastName } = req.body

       if(!firstName || !lastName){
           return res.status(400).json({ error: 'Missing first or last name' })
       }
        const sanitizedFirstName = sanitizeInput(firstName)
        const sanitizedLastName = sanitizeInput(lastName)

       if(!sanitizedFirstName || !sanitizedLastName){
           return res.status(400).json({ error: 'Invalid first or last name' })
       }


        const result = await db.collection('users').findOneAndUpdate(
            { _id: new  MongoClient().ObjectId(userId) },
            {
                $set: {
                    firstName: sanitizedFirstName,
                    lastName: sanitizedLastName,
                    updatedAt: new Date(),
                },
            },
            { returnDocument: 'after' },
        )

         if (!result) {
            return res.status(404).json({ error: 'User not found' })
         }

        const user = {
               id: result._id.toString(),
             username: result.username,
             email: result.email,
              firstName: result.firstName,
              lastName: result.lastName,
              createdAt: result.createdAt,
               updatedAt: result.updatedAt,
        }
         res.status(200).json(user)

    } catch (error: any) {
        if(error instanceof jwt.JsonWebTokenError){
             return res.status(401).json({ error: 'Unauthorized' })
        }
         if (import.meta.env.MODE === 'development') {
             console.error('Error updating user profile:', error)
        }
      return res.status(500).json({ error: 'Internal Server Error' })
    }finally {
         if (db) {
            await closeDB()
        }
    }
})


export default router