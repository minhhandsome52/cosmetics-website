const db = require('../config/database');

const customerService = {
    // Get all customers with order statistics
    async getAllCustomers(search = '', page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let whereClause = "WHERE u.role = 'customer'";
        const params = [];

        if (search) {
            whereClause += " AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // Get customers with order stats
        const [customers] = await db.execute(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.address,
                u.created_at,
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            ${whereClause}
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `, params);

        // Get total count
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total 
            FROM users u 
            ${whereClause}
        `, params);

        return {
            customers,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    },

    // Get customer by ID with details
    async getCustomerById(id) {
        const [customers] = await db.execute(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.address,
                u.created_at,
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            WHERE u.id = ? AND u.role = 'customer'
            GROUP BY u.id
        `, [id]);

        return customers[0] || null;
    },

    // Get customer's order history
    async getCustomerOrders(customerId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const [orders] = await db.execute(`
            SELECT 
                o.id,
                o.total_amount,
                o.discount_amount,
                o.status,
                o.shipping_address,
                o.phone,
                o.notes,
                o.created_at,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
            FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `, [customerId]);

        const [countResult] = await db.execute(
            'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
            [customerId]
        );

        return {
            orders,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    },

    // Get customer statistics for dashboard
    async getStats() {
        // Total customers
        const [totalResult] = await db.execute(
            "SELECT COUNT(*) as total FROM users WHERE role = 'customer'"
        );

        // New customers this month
        const [newThisMonth] = await db.execute(`
            SELECT COUNT(*) as total 
            FROM users 
            WHERE role = 'customer' 
            AND MONTH(created_at) = MONTH(CURRENT_DATE())
            AND YEAR(created_at) = YEAR(CURRENT_DATE())
        `);

        // Top spenders (top 5)
        const [topSpenders] = await db.execute(`
            SELECT 
                u.id,
                u.name,
                u.email,
                COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent,
                COUNT(DISTINCT o.id) as total_orders
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            WHERE u.role = 'customer'
            GROUP BY u.id
            HAVING total_spent > 0
            ORDER BY total_spent DESC
            LIMIT 5
        `);

        return {
            total_customers: totalResult[0].total,
            new_this_month: newThisMonth[0].total,
            top_spenders: topSpenders
        };
    }
};

module.exports = customerService;
