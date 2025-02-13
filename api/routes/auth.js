const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @route   POST /api/v1/auth/register
// @desc    Registrar usuário
// @access  Public
router.post('/register', catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Verificar se usuário já existe
    let user = await User.findOne({ email });
    if (user) {
        return next(new AppError('Email já cadastrado', 400));
    }

    // Criar usuário
    user = await User.create({
        name,
        email,
        password
    });

    // Gerar token
    const token = user.generateAuthToken();

    res.status(201).json({
        status: 'success',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                subscriptionPlan: user.subscriptionPlan
            },
            token
        }
    });
}));

// @route   POST /api/v1/auth/login
// @desc    Login do usuário
// @access  Public
router.post('/login', catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Verificar se email e senha foram fornecidos
    if (!email || !password) {
        return next(new AppError('Por favor, forneça email e senha', 400));
    }

    // Verificar se usuário existe
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Email ou senha incorretos', 401));
    }

    // Gerar token
    const token = user.generateAuthToken();

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                subscriptionPlan: user.subscriptionPlan
            },
            token
        }
    });
}));

// @route   GET /api/v1/auth/me
// @desc    Obter dados do usuário atual
// @access  Private
router.get('/me', auth, catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionStatus: user.subscriptionStatus
            }
        }
    });
}));

module.exports = router;
