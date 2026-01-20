const db = require('../config/database');

// Create order (with FEFO - First Expired First Out)
const createOrder = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { shipping_address, phone, notes, coupon_code } = req.body;

        if (!shipping_address || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address and phone are required'
            });
        }

        // Get cart items
        const [cartItems] = await connection.query(`
            SELECT ci.*, p.name, p.price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `, [req.user.id]);

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        await connection.beginTransaction();

        try {
            // Validate stock and allocate from batches (FEFO)
            const orderItems = [];
            let totalAmount = 0;

            for (const item of cartItems) {
                // Get valid batches ordered by expiry date (FEFO)
                const [batches] = await connection.query(`
                    SELECT b.id, b.batch_number, b.expiry_date, i.quantity
                    FROM batches b
                    JOIN inventory i ON b.id = i.batch_id
                    WHERE b.product_id = ? 
                    AND b.expiry_date > CURDATE()
                    AND b.status = 'active'
                    AND i.quantity > 0
                    ORDER BY b.expiry_date ASC
                    FOR UPDATE
                `, [item.product_id]);

                // Calculate available stock
                const availableStock = batches.reduce((sum, b) => sum + b.quantity, 0);

                if (availableStock < item.quantity) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Không đủ hàng cho sản phẩm "${item.name}". Chỉ còn ${availableStock} sản phẩm còn hạn sử dụng.`
                    });
                }

                // Allocate from batches (FEFO)
                let remainingQty = item.quantity;
                for (const batch of batches) {
                    if (remainingQty <= 0) break;

                    const allocateQty = Math.min(remainingQty, batch.quantity);

                    orderItems.push({
                        product_id: item.product_id,
                        batch_id: batch.id,
                        quantity: allocateQty,
                        unit_price: item.price
                    });

                    // Update inventory
                    await connection.query(
                        'UPDATE inventory SET quantity = quantity - ? WHERE batch_id = ?',
                        [allocateQty, batch.id]
                    );

                    // Check if batch is sold out
                    if (batch.quantity - allocateQty === 0) {
                        await connection.query(
                            "UPDATE batches SET status = 'sold_out' WHERE id = ?",
                            [batch.id]
                        );
                    }

                    remainingQty -= allocateQty;
                }

                totalAmount += item.price * item.quantity;
            }

            // Handle Coupon
            let couponId = null;
            let discountAmount = 0;

            if (coupon_code) {
                // We need to require couponService here inside the function or at top level if cyclic dependency isn't an issue.
                // Safest to import at top, but let's check if we can.
                // Since I can't easily see top of file, I'll use dynamic require or assume I can add it.
                // Better yet, I'll verify the coupon manually or use the service.
                // Let's use the service.
                const couponService = require('../services/couponService');
                try {
                    const couponResult = await couponService.validateCoupon(coupon_code, totalAmount);
                    if (couponResult.isValid) {
                        couponId = couponResult.coupon.id;
                        discountAmount = couponResult.discountAmount;

                        // Increment usage
                        await couponService.incrementUsage(couponId);
                    }
                } catch (error) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: error.message
                    });
                }
            }

            const finalAmount = totalAmount - discountAmount;

            // Create order
            const [orderResult] = await connection.query(
                `INSERT INTO orders (user_id, total_amount, shipping_address, phone, notes, coupon_id, discount_amount)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [req.user.id, finalAmount, shipping_address, phone, notes, couponId, discountAmount]
            );

            const orderId = orderResult.insertId;

            // Create order items
            for (const item of orderItems) {
                await connection.query(
                    `INSERT INTO order_items (order_id, product_id, batch_id, quantity, unit_price)
                     VALUES (?, ?, ?, ?, ?)`,
                    [orderId, item.product_id, item.batch_id, item.quantity, item.unit_price]
                );
            }

            // Clear cart
            await connection.query(
                'DELETE FROM cart_items WHERE user_id = ?',
                [req.user.id]
            );

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: { orderId, totalAmount }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    } finally {
        connection.release();
    }
};

// Get user's orders
const getUserOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, 
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
            FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT o.*, u.name as customer_name, u.email as customer_email,
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
            FROM orders o
            JOIN users u ON o.user_id = u.id
        `;
        const params = [];

        if (status) {
            query += ' WHERE o.status = ?';
            params.push(status);
        }

        // Count total
        const countQuery = query.replace(/SELECT o\.\*, u\.name.*FROM orders o/, 'SELECT COUNT(*) as total FROM orders o');
        const [countResult] = await db.query(countQuery, params);

        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [orders] = await db.query(query, params);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get order details
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get order
        let query = `
            SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `;

        // If not admin, only allow viewing own orders
        if (req.user.role !== 'admin') {
            query += ' AND o.user_id = ?';
        }

        const params = req.user.role !== 'admin' ? [id, req.user.id] : [id];
        const [orders] = await db.query(query, params);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Get order items
        const [items] = await db.query(`
            SELECT oi.*, p.name as product_name, p.brand, p.image_url,
            b.batch_number, b.expiry_date
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN batches b ON oi.batch_id = b.id
            WHERE oi.order_id = ?
        `, [id]);

        res.json({
            success: true,
            data: {
                ...orders[0],
                items
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // If cancelling, restore inventory
        if (status === 'cancelled') {
            const [items] = await db.query(
                'SELECT batch_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            for (const item of items) {
                await db.query(
                    'UPDATE inventory SET quantity = quantity + ? WHERE batch_id = ?',
                    [item.quantity, item.batch_id]
                );
                await db.query(
                    "UPDATE batches SET status = 'active' WHERE id = ? AND status = 'sold_out'",
                    [item.batch_id]
                );
            }
        }

        const [result] = await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated'
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus
};
