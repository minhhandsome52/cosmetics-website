const reviewService = require('../services/reviewService');

const reviewController = {
    // Get reviews for a product
    async getProductReviews(req, res) {
        try {
            const { productId } = req.params;
            const reviews = await reviewService.getByProductId(productId);
            const stats = await reviewService.getAverageRating(productId);

            res.json({
                success: true,
                data: {
                    reviews,
                    avg_rating: stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : 0,
                    total_reviews: stats.total_reviews
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Create a new review
    async createReview(req, res) {
        try {
            const { productId } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user.id;

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ success: false, message: 'Rating phải từ 1-5 sao' });
            }

            const review = await reviewService.create(productId, userId, rating, comment);
            res.status(201).json({ success: true, data: review });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // Delete a review
    async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            const userId = req.user.id;

            const deleted = await reviewService.delete(reviewId, userId);
            if (deleted) {
                res.json({ success: true, message: 'Đã xóa đánh giá' });
            } else {
                res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = reviewController;
