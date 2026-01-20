const db = require('../config/database');

const couponService = {
    // Validate coupon code
    async validateCoupon(code, orderAmount) {
        const [coupons] = await db.query(
            'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
            [code]
        );

        if (coupons.length === 0) {
            throw new Error('Mã giảm giá không tồn tại');
        }

        const coupon = coupons[0];
        const today = new Date();

        // Check dates
        if (coupon.start_date && new Date(coupon.start_date) > today) {
            throw new Error('Mã giảm giá chưa có hiệu lực');
        }
        if (coupon.end_date && new Date(coupon.end_date) < today) {
            throw new Error('Mã giảm giá đã hết hạn');
        }

        // Check usage limits
        if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
            throw new Error('Mã giảm giá đã hết lượt sử dụng');
        }

        // Check min order amount
        if (orderAmount < coupon.min_order_amount) {
            throw new Error(`Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.min_order_amount)} để sử dụng mã này`);
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discount_type === 'percent') {
            discountAmount = (orderAmount * coupon.discount_value) / 100;
        } else {
            discountAmount = coupon.discount_value;
        }

        // Ensure discount doesn't exceed order amount
        if (discountAmount > orderAmount) {
            discountAmount = orderAmount;
        }

        return {
            isValid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value
            },
            discountAmount: parseFloat(discountAmount)
        };
    },

    // Increment usage count
    async incrementUsage(couponId) {
        await db.query(
            'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
            [couponId]
        );
    },

    // Get all coupons (Admin)
    async getAll() {
        const [coupons] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
        return coupons;
    },

    // Get active coupons (Public - for homepage)
    async getActive() {
        const [coupons] = await db.query(`
            SELECT id, code, discount_type, discount_value, min_order_amount, end_date 
            FROM coupons 
            WHERE is_active = 1 
              AND (end_date IS NULL OR end_date >= CURDATE())
              AND (start_date IS NULL OR start_date <= CURDATE())
              AND (max_uses = 0 OR used_count < max_uses)
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        return coupons;
    },

    // Create coupon (Admin)
    async create(data) {
        const { code, discount_type, discount_value, min_order_amount, max_uses, start_date, end_date } = data;
        const [result] = await db.query(
            `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, start_date, end_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [code.toUpperCase(), discount_type, discount_value, min_order_amount || 0, max_uses || 100, start_date, end_date]
        );
        return result.insertId;
    },

    // Get coupon by ID (Admin)
    async getById(id) {
        const [coupons] = await db.query('SELECT * FROM coupons WHERE id = ?', [id]);
        return coupons[0] || null;
    },

    // Update coupon (Admin)
    async update(id, data) {
        const { code, discount_type, discount_value, min_order_amount, max_uses, start_date, end_date, is_active } = data;
        const [result] = await db.query(
            `UPDATE coupons SET 
                code = ?, discount_type = ?, discount_value = ?, 
                min_order_amount = ?, max_uses = ?, start_date = ?, end_date = ?, is_active = ?
             WHERE id = ?`,
            [code.toUpperCase(), discount_type, discount_value, min_order_amount || 0, max_uses || 100, start_date, end_date, is_active !== false ? 1 : 0, id]
        );
        return result.affectedRows > 0;
    },

    // Delete coupon (Admin)
    async delete(id) {
        const [result] = await db.query('DELETE FROM coupons WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = couponService;
