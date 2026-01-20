const wishlistService = require('../services/wishlistService');

const wishlistController = {
    // Get user's wishlist
    async getWishlist(req, res) {
        try {
            const items = await wishlistService.getByUserId(req.user.id);
            res.json({ success: true, data: items });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get wishlist product IDs (for quick UI check)
    async getIds(req, res) {
        try {
            const ids = await wishlistService.getProductIds(req.user.id);
            res.json({ success: true, data: ids });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Toggle wishlist item
    async toggle(req, res) {
        try {
            const { productId } = req.params;
            const result = await wishlistService.toggle(req.user.id, productId);
            res.json({
                success: true,
                data: result,
                message: result.added ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Add to wishlist
    async add(req, res) {
        try {
            const { productId } = req.params;
            const added = await wishlistService.add(req.user.id, productId);
            if (added) {
                res.json({ success: true, message: 'Đã thêm vào yêu thích' });
            } else {
                res.json({ success: true, message: 'Sản phẩm đã có trong danh sách yêu thích' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Remove from wishlist
    async remove(req, res) {
        try {
            const { productId } = req.params;
            await wishlistService.remove(req.user.id, productId);
            res.json({ success: true, message: 'Đã xóa khỏi yêu thích' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get count
    async count(req, res) {
        try {
            const count = await wishlistService.count(req.user.id);
            res.json({ success: true, data: { count } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = wishlistController;
