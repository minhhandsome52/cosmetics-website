const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public route to validate coupon
router.post('/validate', couponController.validate);

// Public route to get active coupons (for homepage)
router.get('/active', couponController.getActive);

// Admin routes
router.get('/', verifyToken, isAdmin, couponController.getAll);
router.post('/', verifyToken, isAdmin, couponController.create);
router.put('/:id', verifyToken, isAdmin, couponController.update);
router.delete('/:id', verifyToken, isAdmin, couponController.delete);

module.exports = router;
