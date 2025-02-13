const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor, informe seu nome']
    },
    email: {
        type: String,
        required: [true, 'Por favor, informe seu email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, informe um email válido']
    },
    password: {
        type: String,
        required: [true, 'Por favor, informe uma senha'],
        minlength: 6,
        select: false
    },
    stripeCustomerId: String,
    subscriptionStatus: {
        type: String,
        enum: ['inactive', 'active', 'past_due', 'canceled'],
        default: 'inactive'
    },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    subscriptionId: String,
    passwordChangedAt: Date,
    usageCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para atualizar timestamps
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Middleware para atualizar timestamps em updates
userSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

// Criptografar senha antes de salvar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Verificar se a senha está correta
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Gerar token JWT
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Verificar se a senha foi alterada após o token ser emitido
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

module.exports = mongoose.model('User', userSchema);
