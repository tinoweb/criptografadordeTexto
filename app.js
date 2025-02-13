const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middleware para Stripe webhook (deve vir antes de express.json())
app.post('/api/v1/subscriptions/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado...'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
const authRoutes = require('./api/routes/auth');
const subscriptionRoutes = require('./api/routes/subscriptions');
const historyRoutes = require('./api/routes/history');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/history', historyRoutes);

// Middleware de erro
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Erro interno do servidor'
    });
});

// Rota para todas as outras requisições
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
