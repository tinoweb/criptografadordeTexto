const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    message: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'tests', // Nome explícito da coleção
    timestamps: true,    // Adiciona createdAt e updatedAt automaticamente
    bufferCommands: false // Desativa o buffer de comandos
});

// Criar o modelo com um nome específico
const Test = mongoose.model('Test', testSchema);

module.exports = Test;
