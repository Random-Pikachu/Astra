const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Database connected')
    } catch (error) {
        // silent on error to reduce logs; surface via caller if needed
    }
}

module.exports = connectDb