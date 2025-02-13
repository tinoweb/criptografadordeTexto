const History = require('../models/History');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/User');

exports.createHistoryEntry = catchAsync(async (req, res, next) => {
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
            status: 'success',
            data: {
                history
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Obter histórico de criptografia
// @route   GET /api/v1/history
// @access  Private
exports.getHistory = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort === 'oldest' ? 'createdAt' : '-createdAt';

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

    const history = await History.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await History.countDocuments(query);

    res.status(200).json({
        status: 'success',
        data: {
            history,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// @desc    Obter item específico do histórico
// @route   GET /api/v1/history/:id
// @access  Private
exports.getHistoryItem = catchAsync(async (req, res, next) => {
    const history = await History.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!history) {
        return next(new AppError('Item não encontrado', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            history
        }
    });
});

// @desc    Criar novo item no histórico
// @route   POST /api/v1/history
// @access  Private
exports.createHistory = catchAsync(async (req, res, next) => {
    const history = await History.create({
        ...req.body,
        user: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: {
            history
        }
    });
});

// @desc    Deletar item do histórico
// @route   DELETE /api/v1/history/:id
// @access  Private
exports.deleteHistory = catchAsync(async (req, res, next) => {
    const history = await History.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
    });

    if (!history) {
        return next(new AppError('Item não encontrado', 404));
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});

// @desc    Atualizar tags do histórico
// @route   PATCH /api/v1/history/:id
// @access  Private
exports.updateTags = catchAsync(async (req, res, next) => {
    const history = await History.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!history) {
        return next(new AppError('Item não encontrado', 404));
    }

    history.tags = req.body.tags;
    await history.save();

    res.status(200).json({
        status: 'success',
        data: {
            history
        }
    });
});

// @desc    Favoritar item do histórico
// @route   PATCH /api/v1/history/:id/favorite
// @access  Private
exports.toggleFavorite = catchAsync(async (req, res, next) => {
    const history = await History.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!history) {
        return next(new AppError('Item não encontrado', 404));
    }

    history.isFavorite = !history.isFavorite;
    await history.save();

    res.status(200).json({
        status: 'success',
        data: {
            history
        }
    });
});
