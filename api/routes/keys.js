const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createCustomKey,
    getCustomKeys,
    getCustomKey,
    updateCustomKey,
    toggleFavorite,
    deleteCustomKey
} = require('../controllers/customKeyController');

// Aplicar proteção em todas as rotas
router.use(protect);

// Rotas para chaves personalizadas
router.route('/')
    .get(getCustomKeys)
    .post(createCustomKey);

router.route('/:id')
    .get(getCustomKey)
    .put(updateCustomKey)
    .delete(deleteCustomKey);

router.route('/:id/favorite')
    .patch(toggleFavorite);

module.exports = router;
