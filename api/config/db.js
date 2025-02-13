const mongoose = require('mongoose');

const connectDB = async () => {
    const connectOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000, // Aumentar timeout para 15 segundos
        socketTimeoutMS: 45000, // Timeout do socket para 45 segundos
        connectTimeoutMS: 15000, // Timeout de conexão para 15 segundos
        retryWrites: true,
        serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true
        }
    };

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, connectOptions);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Adicionar listener para erros de conexão
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        // Reconectar automaticamente se a conexão cair
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected! Attempting to reconnect...');
            setTimeout(() => {
                mongoose.connect(process.env.MONGODB_URI, connectOptions);
            }, 5000);
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        // Tentar reconectar em caso de erro
        setTimeout(() => {
            console.log('Attempting to reconnect to MongoDB...');
            connectDB();
        }, 5000);
    }
};

module.exports = connectDB;
