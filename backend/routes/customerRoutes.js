const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(verifyToken, isAdmin);

// GET /api/customers/stats - Get customer statistics
router.get('/stats', customerController.getStats);

// GET /api/customers - Get all customers
router.get('/', customerController.getAllCustomers);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', customerController.getCustomerById);

// GET /api/customers/:id/orders - Get customer's order history
router.get('/:id/orders', customerController.getCustomerOrders);

module.exports = router;
