const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de proteção de rotas
exports.protect = async function(req, res, next) {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Não autorizado - Token não encontrado'
            });
        }

        try {
            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verificar se o usuário ainda existe
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Não autorizado - Usuário não encontrado'
                });
            }

            // Adicionar usuário à requisição
            req.user = user;
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: 'Não autorizado - Token inválido'
            });
        }
    } catch (err) {
        console.error('Erro no middleware de autenticação:', err);
        return res.status(500).json({
            success: false,
            error: 'Erro no servidor'
        });
    }
};
