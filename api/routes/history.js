const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const auth = require('../middleware/auth');

// Proteger todas as rotas
router.use(auth);

// Rotas básicas
router.route('/')
    .get(historyController.getHistory)
    .post(historyController.createHistory);

router.route('/:id')
    .get(historyController.getHistoryItem)
    .delete(historyController.deleteHistory);

// Rotas adicionais
router.patch('/:id/tags', historyController.updateTags);
router.patch('/:id/favorite', historyController.toggleFavorite);

module.exports = router;
