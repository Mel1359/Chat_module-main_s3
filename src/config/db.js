const mongoose = require('mongoose');

const connectDB = async () => {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('MongoDB connection timeout - 10 seconds'));
        }, 10000);
    });

    try {
        await Promise.race([
            mongoose.connect(process.env.MONGO_URI),
            timeoutPromise
        ]);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;