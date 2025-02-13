const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createHistoryEntry,
    getHistory,
    getHistoryItem,
    toggleFavorite,
    deleteHistoryEntry,
    updateTags
} = require('../controllers/historyController');

// Aplicar proteção em todas as rotas
router.use(protect);

// Rotas do histórico
router.route('/')
    .get(getHistory)
    .post(createHistoryEntry);

router.route('/:id')
    .get(getHistoryItem)
    .delete(deleteHistoryEntry);

router.route('/:id/favorite')
    .patch(toggleFavorite);

router.route('/:id/tags')
    .patch(updateTags);

module.exports = router;
