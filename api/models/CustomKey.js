const mongoose = require('mongoose');

const CustomKeySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    key: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: 'general'
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    lastUsed: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Índices para melhor performance
CustomKeySchema.index({ user: 1, name: 1 }, { unique: true });
CustomKeySchema.index({ user: 1, category: 1 });
CustomKeySchema.index({ user: 1, isFavorite: 1 });

module.exports = mongoose.model('CustomKey', CustomKeySchema);
