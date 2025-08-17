const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDb