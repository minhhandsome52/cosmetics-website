const db = require('../config/database');

const wishlistService = {
    // Get user's wishlist
    async getByUserId(userId) {
        const [items] = await db.query(`
            SELECT w.id, w.product_id, w.created_at,
                   p.name, p.brand, p.price, p.image_url, p.is_active,
                   c.name as category_name
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, [userId]);
        return items;
    },

    // Check if product is in wishlist
    async isInWishlist(userId, productId) {
        const [items] = await db.query(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return items.length > 0;
    },

    // Add to wishlist
    async add(userId, productId) {
        try {
            await db.query(
                'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
                [userId, productId]
            );
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return false; // Already exists
            }
            throw error;
        }
    },

    // Remove from wishlist
    async remove(userId, productId) {
        const [result] = await db.query(
            'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return result.affectedRows > 0;
    },

    // Check product stock
    async getProductStock(productId) {
        const [result] = await db.query(`
            SELECT COALESCE(SUM(inv.quantity), 0) as stock
            FROM inventory inv
            INNER JOIN batches bat ON inv.batch_id = bat.id
            WHERE inv.product_id = ? AND bat.status = 'active'
        `, [productId]);
        return result[0]?.stock || 0;
    },

    // Toggle wishlist (add if not exists, remove if exists)
    async toggle(userId, productId) {
        const exists = await this.isInWishlist(userId, productId);
        if (exists) {
            await this.remove(userId, productId);
            return { added: false };
        } else {
            // Check stock before adding
            const stock = await this.getProductStock(productId);
            if (stock <= 0) {
                throw new Error('Sản phẩm hết hàng không thể thêm vào yêu thích');
            }
            await this.add(userId, productId);
            return { added: true };
        }
    },

    // Get wishlist product IDs only (for quick check)
    async getProductIds(userId) {
        const [items] = await db.query(
            'SELECT product_id FROM wishlist WHERE user_id = ?',
            [userId]
        );
        return items.map(i => i.product_id);
    },

    // Count items in wishlist
    async count(userId) {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?',
            [userId]
        );
        return result[0].count;
    }
};

module.exports = wishlistService;
