const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(verifyToken);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Get just product IDs (for quick check on frontend)
router.get('/ids', wishlistController.getIds);

// Get wishlist count
router.get('/count', wishlistController.count);

// Toggle (add/remove) product in wishlist
router.post('/toggle/:productId', wishlistController.toggle);

// Add to wishlist
router.post('/:productId', wishlistController.add);

// Remove from wishlist
router.delete('/:productId', wishlistController.remove);

module.exports = router;
