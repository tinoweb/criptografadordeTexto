const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    status: {
        type: String,
        enum: ['active', 'canceled', 'expired'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    paymentMethod: {
        type: {
            type: String,
            enum: ['card'],
            required: function() {
                return this.plan !== 'free';
            }
        },
        card: {
            last4: String,
            brand: String,
            expiryMonth: String,
            expiryYear: String
        }
    },
    billingHistory: [{
        amount: Number,
        currency: {
            type: String,
            default: 'BRL'
        },
        status: {
            type: String,
            enum: ['succeeded', 'failed', 'pending'],
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        paymentIntentId: String
    }]
}, {
    timestamps: true
});

// Middleware para atualizar endDate quando o status muda para canceled
SubscriptionSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'canceled') {
        // Se cancelado, define o fim para 30 dias após a data atual
        this.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
