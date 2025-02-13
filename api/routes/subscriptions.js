const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /api/v1/subscriptions/plans
// @desc    Get all subscription plans
// @access  Public
router.get('/plans', async (req, res) => {
    try {
        const plans = [
            {
                id: 'free',
                name: 'Free',
                price: 0,
                features: [
                    'Até 50 criptografias por dia',
                    'Métodos básicos de criptografia',
                    'Histórico limitado'
                ]
            },
            {
                id: 'pro',
                name: 'Pro',
                price: 29.90,
                features: [
                    'Até 1000 criptografias por dia',
                    'Todos os métodos de criptografia',
                    'Histórico completo',
                    'Suporte prioritário'
                ]
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                price: 99.90,
                features: [
                    'Criptografias ilimitadas',
                    'Métodos personalizados',
                    'API dedicada',
                    'Suporte 24/7',
                    'SLA garantido'
                ]
            }
        ];

        res.status(200).json({
            success: true,
            data: plans
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar planos'
        });
    }
});

// @route   GET /api/v1/subscriptions/current
// @desc    Get user's current subscription
// @access  Private
router.get('/current', protect, async (req, res) => {
    try {
        const user = req.user;
        
        res.status(200).json({
            success: true,
            data: {
                plan: user.subscription,
                expiresAt: user.subscriptionExpiresAt
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar assinatura'
        });
    }
});

// @route   POST /api/v1/subscriptions/upgrade
// @desc    Upgrade user's subscription
// @access  Private
router.post('/upgrade', protect, async (req, res) => {
    try {
        const { plan } = req.body;
        const user = req.user;

        if (!['free', 'pro', 'enterprise'].includes(plan)) {
            return res.status(400).json({
                success: false,
                error: 'Plano inválido'
            });
        }

        // Aqui você implementaria a lógica de pagamento
        // Por enquanto, apenas atualizamos o plano do usuário
        user.subscription = plan;
        user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                plan: user.subscription,
                expiresAt: user.subscriptionExpiresAt
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar assinatura'
        });
    }
});

module.exports = router;
