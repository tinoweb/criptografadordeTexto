const CustomKey = require('../models/CustomKey');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Criar uma nova chave personalizada
// @route   POST /api/v1/keys
// @access  Private
exports.createCustomKey = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;
    
    const customKey = await CustomKey.create(req.body);
    
    res.status(201).json({
        success: true,
        data: customKey
    });
});

// @desc    Obter todas as chaves do usuário
// @route   GET /api/v1/keys
// @access  Private
exports.getCustomKeys = asyncHandler(async (req, res, next) => {
    const query = { user: req.user.id };
    
    if (req.query.category) {
        query.category = req.query.category;
    }
    
    if (req.query.favorite === 'true') {
        query.isFavorite = true;
    }
    
    const customKeys = await CustomKey.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
        success: true,
        count: customKeys.length,
        data: customKeys
    });
});

// @desc    Obter uma chave específica
// @route   GET /api/v1/keys/:id
// @access  Private
exports.getCustomKey = asyncHandler(async (req, res, next) => {
    const customKey = await CustomKey.findOne({
        _id: req.params.id,
        user: req.user.id
    });
    
    if (!customKey) {
        return next(new ErrorResponse('Chave não encontrada', 404));
    }
    
    res.status(200).json({
        success: true,
        data: customKey
    });
});

// @desc    Atualizar uma chave
// @route   PUT /api/v1/keys/:id
// @access  Private
exports.updateCustomKey = asyncHandler(async (req, res, next) => {
    let customKey = await CustomKey.findOne({
        _id: req.params.id,
        user: req.user.id
    });
    
    if (!customKey) {
        return next(new ErrorResponse('Chave não encontrada', 404));
    }
    
    customKey = await CustomKey.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );
    
    res.status(200).json({
        success: true,
        data: customKey
    });
});

// @desc    Alternar favorito
// @route   PATCH /api/v1/keys/:id/favorite
// @access  Private
exports.toggleFavorite = asyncHandler(async (req, res, next) => {
    const customKey = await CustomKey.findOne({
        _id: req.params.id,
        user: req.user.id
    });
    
    if (!customKey) {
        return next(new ErrorResponse('Chave não encontrada', 404));
    }
    
    customKey.isFavorite = !customKey.isFavorite;
    await customKey.save();
    
    res.status(200).json({
        success: true,
        data: customKey
    });
});

// @desc    Deletar uma chave
// @route   DELETE /api/v1/keys/:id
// @access  Private
exports.deleteCustomKey = asyncHandler(async (req, res, next) => {
    const customKey = await CustomKey.findOne({
        _id: req.params.id,
        user: req.user.id
    });
    
    if (!customKey) {
        return next(new ErrorResponse('Chave não encontrada', 404));
    }
    
    await customKey.remove();
    
    res.status(200).json({
        success: true,
        data: {}
    });
});
