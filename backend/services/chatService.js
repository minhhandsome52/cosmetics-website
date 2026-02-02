const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt for cosmetics chatbot
const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn mỹ phẩm chuyên nghiệp của Mihn Cosmetics. 

Nhiệm vụ của bạn:
- Tư vấn sản phẩm mỹ phẩm phù hợp với nhu cầu khách hàng
- Giải đáp thắc mắc về chăm sóc da, tóc, làm đẹp
- Gợi ý các sản phẩm dựa trên loại da (dầu, khô, hỗn hợp, nhạy cảm)
- Trả lời ngắn gọn, thân thiện và chuyên nghiệp
- Nếu được cung cấp danh sách sản phẩm, hãy gợi ý từ danh sách đó

Quy tắc:
- Trả lời bằng tiếng Việt
- Không đưa ra lời khuyên y tế
- Giữ câu trả lời ngắn gọn (dưới 200 từ)
- Thân thiện và lịch sự`;

/**
 * Get relevant products from database for context
 */
async function getRelevantProducts(message) {
    try {
        const keywords = message.toLowerCase();
        let categoryFilter = '';

        // Simple keyword matching for categories
        if (keywords.includes('dưỡng da') || keywords.includes('kem dưỡng') || keywords.includes('serum')) {
            categoryFilter = 'AND c.name LIKE "%dưỡng%"';
        } else if (keywords.includes('sữa rửa mặt') || keywords.includes('làm sạch')) {
            categoryFilter = 'AND c.name LIKE "%sạch%"';
        } else if (keywords.includes('trang điểm') || keywords.includes('son') || keywords.includes('phấn')) {
            categoryFilter = 'AND c.name LIKE "%trang điểm%"';
        } else if (keywords.includes('nước hoa')) {
            categoryFilter = 'AND c.name LIKE "%nước hoa%"';
        } else if (keywords.includes('tóc') || keywords.includes('dầu gội')) {
            categoryFilter = 'AND c.name LIKE "%tóc%"';
        }

        const [products] = await db.query(`
            SELECT p.name, p.price, p.description, c.name as category
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1 ${categoryFilter}
            ORDER BY RAND()
            LIMIT 5
        `);

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

/**
 * Helper function to delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send message to Gemini and get response with retry logic
 */
async function chat(userMessage, chatHistory = []) {
    // Models to try in order (verified available from ListModels API)
    const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-001'];

    // Get relevant products for context (do this once)
    const products = await getRelevantProducts(userMessage);

    // Build context with products
    let productContext = '';
    if (products.length > 0) {
        productContext = '\n\nSản phẩm hiện có tại cửa hàng:\n';
        products.forEach(p => {
            productContext += `- ${p.name} (${p.category}): ${p.price.toLocaleString('vi-VN')}đ\n`;
        });
    }

    // Build full prompt with system context
    const fullPrompt = SYSTEM_PROMPT + productContext + '\n\nKhách hàng hỏi: ' + userMessage;

    // Try each model
    for (const modelName of modelsToTry) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                console.log(`Trying model: ${modelName}, attempt: ${attempt + 1}`);

                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(fullPrompt);
                const response = result.response.text();

                return {
                    success: true,
                    message: response,
                    products: products
                };

            } catch (error) {
                console.error(`Error with ${modelName} (attempt ${attempt + 1}):`, error.message);

                // If rate limited, wait and retry
                if (error.status === 429) {
                    if (attempt === 0) {
                        console.log('Rate limited, waiting 3 seconds...');
                        await delay(3000);
                        continue;
                    }
                    // Move to next model after second attempt
                    break;
                }

                // For other errors, try next model
                break;
            }
        }
    }

    // All models failed
    console.error('All Gemini models failed');
    return {
        success: false,
        message: 'Xin lỗi, hệ thống đang quá tải. Vui lòng thử lại sau 1-2 phút nhé! 🙏'
    };
}

module.exports = {
    chat
};
