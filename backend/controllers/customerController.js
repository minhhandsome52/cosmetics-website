const customerService = require('../services/customerService');

const customerController = {
    // Get all customers with pagination and search
    async getAllCustomers(req, res) {
        try {
            const { search = '', page = 1, limit = 10 } = req.query;
            const result = await customerService.getAllCustomers(
                search,
                parseInt(page),
                parseInt(limit)
            );
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get customer statistics
    async getStats(req, res) {
        try {
            const stats = await customerService.getStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get customer by ID
    async getCustomerById(req, res) {
        try {
            const { id } = req.params;
            const customer = await customerService.getCustomerById(id);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khách hàng'
                });
            }

            res.json({ success: true, data: customer });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get customer's order history
    async getCustomerOrders(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const result = await customerService.getCustomerOrders(
                id,
                parseInt(page),
                parseInt(limit)
            );
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = customerController;
