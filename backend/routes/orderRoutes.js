const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus
} = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All order routes require authentication
router.use(verifyToken);

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);

// Admin routes
router.get('/', isAdmin, getAllOrders);
router.put('/:id/status', isAdmin, updateOrderStatus);

module.exports = router;
