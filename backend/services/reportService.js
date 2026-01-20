const db = require('../config/database');

const reportService = {
    // Get today's stats
    async getTodayStats() {
        const today = new Date().toISOString().split('T')[0];

        // Today's revenue
        const [revenueResult] = await db.query(`
            SELECT COALESCE(SUM(total_amount - COALESCE(discount_amount, 0)), 0) as revenue,
                   COUNT(*) as order_count
            FROM orders 
            WHERE DATE(created_at) = ? AND status != 'cancelled'
        `, [today]);

        // New customers today
        const [customersResult] = await db.query(`
            SELECT COUNT(*) as count FROM users 
            WHERE DATE(created_at) = ? AND role = 'customer'
        `, [today]);

        // Best selling product today
        const [bestProduct] = await db.query(`
            SELECT p.name, SUM(oi.quantity) as total_sold
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE DATE(o.created_at) = ? AND o.status != 'cancelled'
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT 1
        `, [today]);

        return {
            revenue: revenueResult[0]?.revenue || 0,
            orderCount: revenueResult[0]?.order_count || 0,
            newCustomers: customersResult[0]?.count || 0,
            bestProduct: bestProduct[0]?.name || 'Chưa có'
        };
    },

    // Get revenue by date range (last 7 days by default)
    async getRevenueByDays(days = 7) {
        const [results] = await db.query(`
            SELECT DATE(created_at) as date,
                   SUM(total_amount - COALESCE(discount_amount, 0)) as revenue,
                   COUNT(*) as orders
            FROM orders
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
              AND status != 'cancelled'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [days]);
        return results;
    },

    // Get revenue by month (last 6 months)
    async getRevenueByMonths(months = 6) {
        const [results] = await db.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
                   SUM(total_amount - COALESCE(discount_amount, 0)) as revenue,
                   COUNT(*) as orders
            FROM orders
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
              AND status != 'cancelled'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        `, [months]);
        return results;
    },

    // Get revenue by category
    async getRevenueByCategory() {
        const [results] = await db.query(`
            SELECT c.name as category,
                   SUM(oi.quantity * oi.price) as revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE o.status != 'cancelled'
            GROUP BY c.id
            ORDER BY revenue DESC
        `);
        return results;
    },

    // Get top selling products
    async getTopProducts(limit = 10) {
        const [results] = await db.query(`
            SELECT p.id, p.name, p.image_url, p.price,
                   SUM(oi.quantity) as total_sold,
                   SUM(oi.quantity * oi.price) as revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.status != 'cancelled'
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT ?
        `, [limit]);
        return results;
    },

    // Get recent orders
    async getRecentOrders(limit = 10) {
        const [results] = await db.query(`
            SELECT o.id, o.total_amount, o.status, o.created_at,
                   u.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT ?
        `, [limit]);
        return results;
    },

    // Get overall stats
    async getOverallStats() {
        const [totalRevenue] = await db.query(`
            SELECT COALESCE(SUM(total_amount - COALESCE(discount_amount, 0)), 0) as total
            FROM orders WHERE status != 'cancelled'
        `);

        const [totalOrders] = await db.query(`
            SELECT COUNT(*) as count FROM orders WHERE status != 'cancelled'
        `);

        const [totalCustomers] = await db.query(`
            SELECT COUNT(*) as count FROM users WHERE role = 'customer'
        `);

        const [totalProducts] = await db.query(`
            SELECT COUNT(*) as count FROM products WHERE is_active = 1
        `);

        return {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders: totalOrders[0]?.count || 0,
            totalCustomers: totalCustomers[0]?.count || 0,
            totalProducts: totalProducts[0]?.count || 0
        };
    }
};

module.exports = reportService;
