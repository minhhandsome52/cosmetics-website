const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/auth');

// Get reviews for a product (public)
router.get('/product/:productId', reviewController.getProductReviews);

// Create a review (authenticated)
router.post('/product/:productId', verifyToken, reviewController.createReview);

// Delete a review (authenticated)
router.delete('/:reviewId', verifyToken, reviewController.deleteReview);

module.exports = router;
