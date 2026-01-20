const express = require('express');
const router = express.Router();
const {
    getAllBatches,
    getExpiringBatches,
    getExpiredBatches,
    checkAvailableStock,
    createBatch,
    updateBatch,
    deleteBatch,
    updateInventory,
    getDashboardStats
} = require('../controllers/batchController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes (for checking stock)
router.get('/check/:productId', checkAvailableStock);

// Admin routes
router.get('/', verifyToken, isAdmin, getAllBatches);
router.get('/expiring', verifyToken, isAdmin, getExpiringBatches);
router.get('/expired', verifyToken, isAdmin, getExpiredBatches);
router.get('/dashboard-stats', verifyToken, isAdmin, getDashboardStats);
router.post('/', verifyToken, isAdmin, createBatch);
router.put('/:id', verifyToken, isAdmin, updateBatch);
router.delete('/:id', verifyToken, isAdmin, deleteBatch);
router.put('/inventory/:batch_id', verifyToken, isAdmin, updateInventory);

module.exports = router;
