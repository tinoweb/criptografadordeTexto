const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    originalText: {
        type: String,
        required: true
    },
    encryptedText: {
        type: String,
        required: true
    },
    encryptionType: {
        type: String,
        enum: ['email', 'sms', 'custom'],
        required: true
    },
    customKey: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String,
        trim: true
    }],
    isFavorite: {
        type: Boolean,
        default: false
    }
});

// Índices para melhorar performance de busca
historySchema.index({ user: 1, createdAt: -1 });
historySchema.index({ tags: 1 });
historySchema.index({ isFavorite: 1 });

// Método para limitar o histórico para usuários free
historySchema.statics.cleanOldHistoryForFreeUser = async function(userId) {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    
    if (!user.isPro) {
        // Manter apenas os últimos 10 registros para usuários free
        const oldestAllowed = await this.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(9)  // 10 - 1 (para pegar o 11º item)
            .limit(1);

        if (oldestAllowed.length > 0) {
            await this.deleteMany({
                user: userId,
                createdAt: { $lt: oldestAllowed[0].createdAt }
            });
        }
    }
};

// Middleware para limpar histórico antigo após salvar
historySchema.post('save', async function(doc) {
    await doc.constructor.cleanOldHistoryForFreeUser(doc.user);
});

const History = mongoose.model('History', historySchema);

module.exports = History;
