require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// Conectar ao MongoDB
connectDB();

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: false // Desabilitar temporariamente para desenvolvimento
}));
app.use(mongoSanitize());
app.use(compression());
app.use(cookieParser());

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100
});
app.use('/api', limiter);

// Definir rotas da API ANTES dos arquivos estáticos
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/encryption', require('./routes/encryption'));
app.use('/api/v1/history', require('./routes/history')); // Rota do histórico
app.use('/api/v1/keys', require('./routes/keys')); // Rota das chaves personalizadas
app.use('/api/v1/subscriptions', require('./routes/subscriptions'));
app.use('/api/test', require('./routes/test'));

// Servir arquivos estáticos DEPOIS das rotas da API
app.use(express.static(path.join(__dirname, '../public')));

// Rota para a página de autenticação
app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/auth.html'));
});

// Rota raiz - serve o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rota para todas as outras requisições - deve ser a ÚLTIMA
app.get('*', (req, res) => {
    // Se a URL começar com /api, retornar erro 404 em JSON
    if (req.url.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            error: 'API endpoint não encontrado'
        });
    }
    // Caso contrário, retornar o index.html
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : err.message
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        mongoose.connection.close(false, () => {
            process.exit(0);
        });
    });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
