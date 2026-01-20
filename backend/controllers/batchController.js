const db = require('../config/database');

// Get all batches with filters
const getAllBatches = async (req, res) => {
    try {
        const { product_id, status } = req.query;

        let query = `
            SELECT b.*, p.name as product_name, p.brand,
            i.quantity as current_quantity,
            DATEDIFF(b.expiry_date, CURDATE()) as days_until_expiry
            FROM batches b
            LEFT JOIN products p ON b.product_id = p.id
            LEFT JOIN inventory i ON b.id = i.batch_id
            WHERE 1=1
        `;
        const params = [];

        if (product_id) {
            query += ' AND b.product_id = ?';
            params.push(product_id);
        }

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.expiry_date ASC';

        const [batches] = await db.query(query, params);

        res.json({
            success: true,
            data: batches
        });
    } catch (error) {
        console.error('Get batches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get expiring batches (within 30 days)
const getExpiringBatches = async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const [batches] = await db.query(`
            SELECT b.*, p.name as product_name, p.brand,
            i.quantity as current_quantity,
            DATEDIFF(b.expiry_date, CURDATE()) as days_until_expiry
            FROM batches b
            LEFT JOIN products p ON b.product_id = p.id
            LEFT JOIN inventory i ON b.id = i.batch_id
            WHERE b.expiry_date > CURDATE() 
            AND b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND b.status = 'active'
            AND i.quantity > 0
            ORDER BY b.expiry_date ASC
        `, [parseInt(days)]);

        res.json({
            success: true,
            data: batches,
            count: batches.length
        });
    } catch (error) {
        console.error('Get expiring batches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get expired batches
const getExpiredBatches = async (req, res) => {
    try {
        const [batches] = await db.query(`
            SELECT b.*, p.name as product_name, p.brand,
            i.quantity as current_quantity,
            DATEDIFF(CURDATE(), b.expiry_date) as days_expired
            FROM batches b
            LEFT JOIN products p ON b.product_id = p.id
            LEFT JOIN inventory i ON b.id = i.batch_id
            WHERE b.expiry_date <= CURDATE()
            ORDER BY b.expiry_date DESC
        `);

        // Update status to expired
        await db.query(`
            UPDATE batches SET status = 'expired' 
            WHERE expiry_date <= CURDATE() AND status = 'active'
        `);

        res.json({
            success: true,
            data: batches,
            count: batches.length
        });
    } catch (error) {
        console.error('Get expired batches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Check available stock for a product (only valid batches)
const checkAvailableStock = async (req, res) => {
    try {
        const { productId } = req.params;

        const [result] = await db.query(`
            SELECT SUM(i.quantity) as available_stock
            FROM inventory i
            JOIN batches b ON i.batch_id = b.id
            WHERE b.product_id = ? 
            AND b.expiry_date > CURDATE() 
            AND b.status = 'active'
        `, [productId]);

        const [batches] = await db.query(`
            SELECT b.id, b.batch_number, b.expiry_date, i.quantity,
            DATEDIFF(b.expiry_date, CURDATE()) as days_until_expiry
            FROM batches b
            JOIN inventory i ON b.id = i.batch_id
            WHERE b.product_id = ? 
            AND b.expiry_date > CURDATE() 
            AND b.status = 'active'
            AND i.quantity > 0
            ORDER BY b.expiry_date ASC
        `, [productId]);

        res.json({
            success: true,
            data: {
                available_stock: result[0].available_stock || 0,
                valid_batches: batches
            }
        });
    } catch (error) {
        console.error('Check stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create batch (Admin)
const createBatch = async (req, res) => {
    try {
        const { product_id, batch_number, manufacture_date, expiry_date, initial_quantity } = req.body;

        if (!product_id || !batch_number || !manufacture_date || !expiry_date || !initial_quantity) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if expiry date is valid
        if (new Date(expiry_date) <= new Date(manufacture_date)) {
            return res.status(400).json({
                success: false,
                message: 'Expiry date must be after manufacture date'
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Create batch
            const [batchResult] = await connection.query(
                `INSERT INTO batches (product_id, batch_number, manufacture_date, expiry_date, initial_quantity)
                 VALUES (?, ?, ?, ?, ?)`,
                [product_id, batch_number, manufacture_date, expiry_date, initial_quantity]
            );

            // Create inventory record
            await connection.query(
                'INSERT INTO inventory (batch_id, quantity) VALUES (?, ?)',
                [batchResult.insertId, initial_quantity]
            );

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Batch created successfully',
                data: { id: batchResult.insertId }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Create batch error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Batch number already exists for this product'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update batch and inventory (Admin)
const updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { batch_number, manufacture_date, expiry_date, status, initial_quantity, product_id } = req.body;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Check if expiry date is valid
            if (manufacture_date && expiry_date && new Date(expiry_date) <= new Date(manufacture_date)) {
                return res.status(400).json({
                    success: false,
                    message: 'Expiry date must be after manufacture date'
                });
            }

            // Update batch details
            const [batchResult] = await connection.query(
                `UPDATE batches SET batch_number = ?, manufacture_date = ?, expiry_date = ?, status = ?, product_id = ?
                 WHERE id = ?`,
                [batch_number, manufacture_date, expiry_date, status || 'active', product_id, id]
            );

            if (batchResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Batch not found'
                });
            }

            // Update inventory quantity if provided
            if (initial_quantity !== undefined) {
                await connection.query(
                    'UPDATE inventory SET quantity = ? WHERE batch_id = ?',
                    [initial_quantity, id]
                );
            }

            await connection.commit();

            res.json({
                success: true,
                message: 'Batch updated successfully'
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Update batch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete batch (Admin)
const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Delete inventory first (foreign key)
            await connection.query('DELETE FROM inventory WHERE batch_id = ?', [id]);

            // Delete batch
            const [result] = await connection.query('DELETE FROM batches WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Batch not found'
                });
            }

            await connection.commit();

            res.json({
                success: true,
                message: 'Batch deleted successfully'
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Delete batch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update inventory quantity (Admin)
const updateInventory = async (req, res) => {
    try {
        const { batch_id } = req.params;
        const { quantity } = req.body;

        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity cannot be negative'
            });
        }

        const [result] = await db.query(
            'UPDATE inventory SET quantity = ? WHERE batch_id = ?',
            [quantity, batch_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inventory record not found'
            });
        }

        // Update batch status if sold out
        if (quantity === 0) {
            await db.query(
                "UPDATE batches SET status = 'sold_out' WHERE id = ?",
                [batch_id]
            );
        }

        res.json({
            success: true,
            message: 'Inventory updated successfully'
        });
    } catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get dashboard stats (Admin)
const getDashboardStats = async (req, res) => {
    try {
        // Expiring in 30 days
        const [expiring] = await db.query(`
            SELECT COUNT(*) as count FROM batches b
            JOIN inventory i ON b.id = i.batch_id
            WHERE b.expiry_date > CURDATE() 
            AND b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            AND b.status = 'active' AND i.quantity > 0
        `);

        // Already expired
        const [expired] = await db.query(`
            SELECT COUNT(*) as count FROM batches 
            WHERE expiry_date <= CURDATE()
        `);

        // Low stock (less than 20)
        const [lowStock] = await db.query(`
            SELECT COUNT(*) as count FROM inventory i
            JOIN batches b ON i.batch_id = b.id
            WHERE i.quantity < 20 AND i.quantity > 0 AND b.status = 'active'
        `);

        // Total products
        const [totalProducts] = await db.query(
            'SELECT COUNT(*) as count FROM products WHERE is_active = 1'
        );

        // Pending orders
        const [pendingOrders] = await db.query(
            "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
        );

        res.json({
            success: true,
            data: {
                expiring_batches: expiring[0].count,
                expired_batches: expired[0].count,
                low_stock: lowStock[0].count,
                total_products: totalProducts[0].count,
                pending_orders: pendingOrders[0].count
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getAllBatches,
    getExpiringBatches,
    getExpiredBatches,
    checkAvailableStock,
    createBatch,
    updateBatch,
    deleteBatch,
    updateInventory,
    getDashboardStats
};
