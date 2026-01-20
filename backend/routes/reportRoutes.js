const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All report routes require admin authentication
router.use(verifyToken, isAdmin);

// Dashboard stats (today + overall)
router.get('/dashboard', reportController.getDashboardStats);

// Revenue chart data
router.get('/revenue', reportController.getRevenueChart);

// Revenue by category (pie chart)
router.get('/categories', reportController.getCategoryRevenue);

// Top selling products
router.get('/top-products', reportController.getTopProducts);

// Recent orders
router.get('/recent-orders', reportController.getRecentOrders);

module.exports = router;
