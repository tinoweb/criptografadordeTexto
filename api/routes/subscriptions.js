const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/auth');

// Rotas protegidas (requerem autenticação)
router.use(authMiddleware);
router.post('/create-checkout-session', subscriptionController.createCheckoutSession);
router.get('/verify-payment/:sessionId', subscriptionController.verifyPayment);

// Rota do webhook (não requer autenticação)
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    subscriptionController.webhook
);

module.exports = router;
