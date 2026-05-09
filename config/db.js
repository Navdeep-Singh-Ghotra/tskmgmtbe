const mongoose = require("mongoose");


const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || require('config').get('mongoURI');

        console.log('Connecting to MongoDB...');

        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);

    }
}

module.exports = connectDB;


/*
cat > secrets.json <<EOF
{
  "MONGODB_URI"= "mongodb://navadmin:Infy%40123@127.0.0.1:27017/navdb?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin&appName=mongosh+2.2.12",
  "JWT_SECRET"= "mysecret",
  "API_KEY"= "api-key-789"
}
EOF
*/
