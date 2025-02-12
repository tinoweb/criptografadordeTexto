const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EncryptionHistory = require('../models/EncryptionHistory');

// @route   POST /api/v1/encryption
// @desc    Encrypt text
// @access  Private
router.post('/', auth, async (req, res) => {
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
        
        switch(type) {
            case 'email':
                encryptedText = '\u202E' + text.split('').reverse().join('');
                break;
            case 'sms':
                encryptedText = text.split('').map(char => {
                    return cirilicMap[char.toLowerCase()] || char;
                }).join('');
                break;
            case 'anuncios':
                encryptedText = text.split('').map(char => {
                    const mappedChar = cirilicMap[char.toLowerCase()] || char;
                    return '\u200B' + mappedChar;
                }).join('');
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid encryption type'
                });
        }

        // Save encryption history
        await EncryptionHistory.create({
            user: user._id,
            encryptionType: type,
            originalTextLength: text.length,
            encryptedTextLength: encryptedText.length,
            metadata: {
                browser: req.headers['user-agent'],
                platform: req.headers['sec-ch-ua-platform'],
                ip: req.ip
            }
        });

        // Increment user's usage count
        await User.findByIdAndUpdate(user._id, {
            $inc: { usageCount: 1 }
        });

        res.status(200).json({
            success: true,
            data: {
                encryptedText,
                remainingUsage: limits[user.subscription] - (usageToday + 1)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   GET /api/v1/encryption/history
// @desc    Get user's encryption history
// @access  Private
router.get('/history', auth, async (req, res) => {
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
