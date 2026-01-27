const mongoose = require("mongoose");

console.log(db);

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || require('config').get('mongoURI');

        console.log('Connecting to MongoDB...');

        await mongoose.connect(db);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);

    }
}

module.exports = connectDB;