import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import { initReminderCron } from './config/cron.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import seedAdmin from './config/seedAdmin.js'

//app config
const app = express()
const port = process.env.PORT || 4000

// ✅ Database Connection
connectDB()
  .then(() => {
    console.log("✅ MongoDB Connected Successfully...")
    seedAdmin()
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message)
  })

// Cloudinary + Cron
connectCloudinary()
initReminderCron()

//middlewares
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.includes('/payment/webhook')) {
      req.rawBody = buf.toString();
    }
  }
}))
app.use(cors())

//api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
  res.send('API Working')
})

app.listen(port, () => {
  console.log('🚀 Server Started at port', port)
})
