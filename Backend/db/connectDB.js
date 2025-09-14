const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected successfully');
    } catch (error) {
        // silent on error to reduce logs; surface via caller if needed
        console.error('MongoDB connection error:', error);
    }
}

module.exports = connectDb