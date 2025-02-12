const mongoose = require('mongoose');

const EncryptionHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    encryptionType: {
        type: String,
        enum: ['email', 'sms', 'anuncios', 'custom'],
        required: true
    },
    originalTextLength: {
        type: Number,
        required: true
    },
    encryptedTextLength: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    metadata: {
        browser: String,
        platform: String,
        ip: String
    }
});

// Add index for better query performance
EncryptionHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('EncryptionHistory', EncryptionHistorySchema);
