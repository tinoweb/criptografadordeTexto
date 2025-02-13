const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Middleware de proteção de rotas
module.exports = catchAsync(async (req, res, next) => {
    // 1) Verificar se o token existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new AppError('Você não está logado. Por favor, faça login para ter acesso.', 401));
    }

    // 2) Verificar se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Verificar se o usuário ainda existe
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError('O usuário deste token não existe mais.', 401));
    }

    // 4) Verificar se o usuário mudou a senha depois que o token foi emitido
    if (user.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Usuário mudou a senha recentemente. Por favor, faça login novamente.', 401));
    }

    // Adicionar usuário à requisição
    req.user = user;
    next();
});
