const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    originalText: {
        type: String,
        required: [true, 'Por favor, forneça o texto original']
    },
    encryptedText: {
        type: String,
        required: [true, 'Por favor, forneça o texto criptografado']
    },
    encryptionType: {
        type: String,
        enum: ['email', 'sms', 'anuncios'],
        required: [true, 'Por favor, especifique o tipo de criptografia']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índice para melhorar a performance das consultas
historySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);
