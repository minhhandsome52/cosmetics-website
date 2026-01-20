const reportService = require('../services/reportService');

const reportController = {
    // Get dashboard stats
    async getDashboardStats(req, res) {
        try {
            const [todayStats, overallStats] = await Promise.all([
                reportService.getTodayStats(),
                reportService.getOverallStats()
            ]);

            res.json({
                success: true,
                data: { today: todayStats, overall: overallStats }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get revenue chart data
    async getRevenueChart(req, res) {
        try {
            const { period = 'days', range = 7 } = req.query;

            let data;
            if (period === 'months') {
                data = await reportService.getRevenueByMonths(parseInt(range));
            } else {
                data = await reportService.getRevenueByDays(parseInt(range));
            }

            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get category revenue
    async getCategoryRevenue(req, res) {
        try {
            const data = await reportService.getRevenueByCategory();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get top products
    async getTopProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const data = await reportService.getTopProducts(limit);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get recent orders
    async getRecentOrders(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const data = await reportService.getRecentOrders(limit);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = reportController;
