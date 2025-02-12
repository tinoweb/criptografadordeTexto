const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Registrar um novo usuário
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Verificar se o usuário já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        // Criar usuário
        const user = await User.create({
            name,
            email,
            password
        });

        // Gerar token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'seu_jwt_secret_aqui',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                subscription: user.subscription
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao registrar usuário',
            error: error.message
        });
    }
};

// @desc    Login de usuário
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar se email e senha foram fornecidos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, forneça email e senha'
            });
        }

        // Verificar se o usuário existe
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // Verificar se a senha está correta
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // Gerar token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'seu_jwt_secret_aqui',
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                subscription: user.subscription
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao fazer login',
            error: error.message
        });
    }
};

// @desc    Obter usuário atual
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                subscription: user.subscription
            }
        });
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter dados do usuário',
            error: error.message
        });
    }
};
