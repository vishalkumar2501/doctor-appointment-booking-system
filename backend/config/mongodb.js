import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim()

    if (!mongoUri) {
      console.error('❌ MongoDB Connection Error: MONGO_URI or MONGODB_URI is not defined in .env')
      return
    }

    mongoose.connection.on('connected', () => console.log('✅ Database Connected'))
    mongoose.connection.on('error', (err) => console.error('❌ Database Connection Error:', err.message))
    mongoose.connection.on('disconnected', () => console.log('⚠️ Database Disconnected'))

    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB Connected Successfully')
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message)
  }
}

export default connectDB

