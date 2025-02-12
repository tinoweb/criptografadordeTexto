const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

// Configuração do cliente MongoDB
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const connectDB = async () => {
    try {
        // Conectar o cliente ao servidor
        await client.connect();
        
        // Enviar um ping para confirmar a conexão
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // Configurar o Mongoose para usar a conexão existente
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });

        console.log('Mongoose connected successfully');

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Manipuladores de eventos do Mongoose
mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

process.on('SIGINT', async () => {
    try {
        await client.close();
        await mongoose.connection.close();
        console.log('MongoDB connections closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connections:', error);
        process.exit(1);
    }
});

module.exports = connectDB;
