const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const EncryptionHistory = require('../models/EncryptionHistory');

// @route   POST /api/v1/encryption
// @desc    Encrypt text
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { text, type } = req.body;
        const user = req.user;

        // Check usage limits based on subscription
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const usageToday = await EncryptionHistory.countDocuments({
            user: user._id,
            createdAt: { $gte: today }
        });

        const limits = {
            free: 50,
            pro: 1000,
            enterprise: Infinity
        };

        if (usageToday >= limits[user.subscription]) {
            return res.status(429).json({
                success: false,
                error: 'Daily usage limit reached. Please upgrade your plan.'
            });
        }

        // Perform encryption based on type
        let encryptedText = '';
        switch (type) {
            case 'email':
                // Inverte o texto para exibição da direita para a esquerda
                encryptedText = text.split('').reverse().join('');
                break;

            case 'sms':
                // Substitui caracteres por equivalentes cirílicos
                const cyrillicMap = {
                    'a': 'а', 'b': 'в', 'c': 'с', 'd': 'ԁ', 'e': 'е',
                    'f': 'ғ', 'g': 'ԍ', 'h': 'һ', 'i': 'і', 'j': 'ј',
                    'k': 'к', 'l': 'ӏ', 'm': 'м', 'n': 'п', 'o': 'о',
                    'p': 'р', 'q': 'ԛ', 'r': 'г', 's': 'ѕ', 't': 'т',
                    'u': 'ц', 'v': 'ѵ', 'w': 'ԝ', 'x': 'х', 'y': 'у',
                    'z': 'ʒ'
                };
                encryptedText = text.toLowerCase().split('').map(char => 
                    cyrillicMap[char] || char
                ).join('');
                break;

            case 'anuncios':
                // Usa caracteres cirílicos + espaço de largura zero
                const zeroWidthSpace = '\u200B';
                encryptedText = text.split('').map(char => {
                    const cyrillic = cyrillicMap[char.toLowerCase()] || char;
                    return cyrillic + zeroWidthSpace;
                }).join('');
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid encryption type'
                });
        }

        // Save to history
        const historyEntry = await EncryptionHistory.create({
            user: user._id,
            originalText: text,
            encryptedText,
            type
        });

        res.status(200).json({
            success: true,
            data: {
                encryptedText,
                historyId: historyEntry._id
            }
        });
    } catch (err) {
        console.error('Erro na criptografia:', err);
        res.status(500).json({
            success: false,
            error: 'Error encrypting text'
        });
    }
});

// @route   GET /api/v1/encryption/history
// @desc    Get user's encryption history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const history = await EncryptionHistory.find({ user: req.user._id })
            .sort('-createdAt')
            .limit(100);

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
