const chatService = require('../services/chatService');

/**
 * Handle chat message
 * POST /api/chat
 */
async function sendMessage(req, res) {
    try {
        const { message, history } = req.body;

        // Validate input
        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tin nhắn'
            });
        }

        // Get AI response
        const response = await chatService.chat(message.trim(), history || []);

        res.json(response);

    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi. Vui lòng thử lại.'
        });
    }
}

module.exports = {
    sendMessage
};
