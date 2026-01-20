const db = require('../config/database');

const reviewService = {
    // Get reviews for a product
    async getByProductId(productId) {
        const [rows] = await db.query(`
            SELECT r.*, u.name as user_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = ? 
            ORDER BY r.created_at DESC
        `, [productId]);
        return rows;
    },

    // Get average rating for a product
    async getAverageRating(productId) {
        const [rows] = await db.query(`
            SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews 
            FROM reviews 
            WHERE product_id = ?
        `, [productId]);
        return rows[0];
    },

    // Create a new review
    async create(productId, userId, rating, comment) {
        // Check if user already reviewed this product
        const [existing] = await db.query(
            'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
            [productId, userId]
        );

        if (existing.length > 0) {
            throw new Error('Bạn đã đánh giá sản phẩm này rồi');
        }

        const [result] = await db.query(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [productId, userId, rating, comment]
        );
        return { id: result.insertId, product_id: productId, user_id: userId, rating, comment };
    },

    // Delete a review
    async delete(reviewId, userId) {
        const [result] = await db.query(
            'DELETE FROM reviews WHERE id = ? AND user_id = ?',
            [reviewId, userId]
        );
        return result.affectedRows > 0;
    }
};

module.exports = reviewService;
