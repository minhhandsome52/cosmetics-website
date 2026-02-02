const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

// All cart routes require authentication
router.use(verifyToken);

router.get('/', getCart); // lấy giỏ
router.post('/', addToCart); // thêm vào
router.put('/:id', updateCartItem); // cập nhập
router.delete('/:id', removeFromCart); // xóa
router.delete('/', clearCart); // xóa sạch

module.exports = router;
