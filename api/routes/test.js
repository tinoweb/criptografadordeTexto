const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const mongoose = require('mongoose');

// Rota para testar a conexão
router.get('/', async (req, res) => {
    try {
        // Verificar estado da conexão
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }

        // Criar e salvar um documento de teste
        const testDoc = await Test.create({
            message: 'Teste de conexão com MongoDB ' + new Date().toISOString()
        });

        console.log('Test document created:', testDoc._id);

        // Buscar documentos recentes
        const recentTests = await Test.find()
            .sort('-createdAt')
            .limit(5)
            .exec();

        console.log(`Found ${recentTests.length} recent documents`);

        res.json({
            success: true,
            message: 'Conexão com MongoDB está funcionando!',
            testDoc,
            recentTests,
            connectionState: mongoose.connection.readyState
        });

    } catch (error) {
        console.error('Erro no teste:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao testar conexão com MongoDB',
            error: error.message,
            connectionState: mongoose.connection.readyState
        });
    }
});

module.exports = router;
