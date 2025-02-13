const History = require('../models/History');
const User = require('../models/User');

exports.createHistoryEntry = async (req, res) => {
    try {
        const { originalText, encryptedText, encryptionType, customKey, tags } = req.body;
        
        const history = await History.create({
            user: req.user.id,
            originalText,
            encryptedText,
            encryptionType,
            customKey,
            tags
        });

        res.status(201).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        
        let query = { user: req.user.id };
        
        // Filtros
        if (req.query.favorite) {
            query.isFavorite = req.query.favorite === 'true';
        }
        
        if (req.query.type) {
            query.encryptionType = req.query.type;
        }
        
        if (req.query.search) {
            query.$or = [
                { originalText: { $regex: req.query.search, $options: 'i' } },
                { tags: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const total = await History.countDocuments(query);
        
        const history = await History.find(query)
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: history,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.toggleFavorite = async (req, res) => {
    try {
        const history = await History.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!history) {
            return res.status(404).json({
                success: false,
                error: 'Registro não encontrado'
            });
        }

        history.isFavorite = !history.isFavorite;
        await history.save();

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.deleteHistoryEntry = async (req, res) => {
    try {
        const history = await History.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!history) {
            return res.status(404).json({
                success: false,
                error: 'Registro não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateTags = async (req, res) => {
    try {
        const history = await History.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!history) {
            return res.status(404).json({
                success: false,
                error: 'Registro não encontrado'
            });
        }

        history.tags = req.body.tags;
        await history.save();

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getHistoryItem = async (req, res) => {
    try {
        const history = await History.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!history) {
            return res.status(404).json({
                success: false,
                error: 'Registro não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
