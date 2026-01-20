const couponService = require('../services/couponService');

const couponController = {
    // Validate coupon
    async validate(req, res) {
        try {
            const { code, orderAmount } = req.body;

            if (!code || !orderAmount) {
                return res.status(400).json({ success: false, message: 'Missing code or order amount' });
            }

            const result = await couponService.validateCoupon(code, parseFloat(orderAmount));
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // Get active coupons (Public - for homepage)
    async getActive(req, res) {
        try {
            const coupons = await couponService.getActive();
            res.json({ success: true, data: coupons });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get all coupons (Admin)
    async getAll(req, res) {
        try {
            const coupons = await couponService.getAll();
            res.json({ success: true, data: coupons });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Create coupon (Admin)
    async create(req, res) {
        try {
            await couponService.create(req.body);
            res.status(201).json({ success: true, message: 'Coupon created successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Update coupon (Admin)
    async update(req, res) {
        try {
            const { id } = req.params;
            const updated = await couponService.update(id, req.body);
            if (updated) {
                res.json({ success: true, message: 'Coupon updated successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Coupon not found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Delete coupon (Admin)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await couponService.delete(id);
            if (deleted) {
                res.json({ success: true, message: 'Coupon deleted successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Coupon not found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = couponController;
