const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

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
                    'Todos os métodos de criptografia',
                    'API de integração',
                    'Suporte 24/7',
                    'Personalização de métodos'
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

// @route   POST /api/v1/subscriptions
// @desc    Create new subscription
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { planId } = req.body;
        
        // Verificar se o plano é válido
        if (!['free', 'pro', 'enterprise'].includes(planId)) {
            return res.status(400).json({
                success: false,
                error: 'Plano inválido'
            });
        }

        // Atualizar plano do usuário
        const user = req.user;
        user.subscription = planId;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                subscription: planId
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Erro ao criar assinatura'
        });
    }
});

// @route   GET /api/v1/subscriptions/current
// @desc    Get current subscription
// @access  Private
router.get('/current', auth, async (req, res) => {
    try {
        const user = req.user;
        
        res.status(200).json({
            success: true,
            data: {
                subscription: user.subscription
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar assinatura atual'
        });
    }
});

module.exports = router;
