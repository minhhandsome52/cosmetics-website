const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllBrands
} = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/brands', getAllBrands);
router.get('/:id', getProductById);

// Admin routes
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
