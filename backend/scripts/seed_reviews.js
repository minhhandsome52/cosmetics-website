const db = require('../config/database');

const reviews = [
    { product_id: 1, user_id: 1, rating: 5, comment: 'Sản phẩm tuyệt vời, da mịn màng hơn sau 1 tuần!' },
    { product_id: 1, user_id: 2, rating: 4, comment: 'Chất lượng tốt, đóng gói cẩn thận' },
    { product_id: 1, user_id: 1, rating: 5, comment: 'Rất hài lòng, sẽ mua lại' },
    { product_id: 2, user_id: 2, rating: 5, comment: 'Giữ ẩm rất tốt, mùi thơm dễ chịu' },
    { product_id: 2, user_id: 1, rating: 4, comment: 'Sản phẩm chính hãng, giao hàng nhanh' },
    { product_id: 3, user_id: 1, rating: 5, comment: 'Son đẹp lắm, lên màu chuẩn' },
    { product_id: 3, user_id: 2, rating: 5, comment: 'Mua lần 2 rồi, rất thích' },
    { product_id: 3, user_id: 1, rating: 4, comment: 'Màu đẹp nhưng hơi khô môi' },
    { product_id: 4, user_id: 2, rating: 4, comment: 'Nước hoa thơm lâu, rất nam tính' },
    { product_id: 4, user_id: 1, rating: 5, comment: 'Mùi hương sang trọng' },
    { product_id: 5, user_id: 1, rating: 5, comment: 'Mùi hương rất nữ tính và quyến rũ' },
    { product_id: 5, user_id: 2, rating: 4, comment: 'Giữ mùi tốt, đáng tiền' },
    { product_id: 6, user_id: 2, rating: 5, comment: 'Kem chống nắng không bết dính' },
    { product_id: 6, user_id: 1, rating: 4, comment: 'Dùng tốt, không gây kích ứng' }
];

const seedReviews = async () => {
    try {
        console.log('🌱 Starting to seed reviews...');

        // Delete existing reviews to avoid duplicates if run multiple times
        // await db.query('DELETE FROM reviews'); 
        // console.log('Deleted existing reviews');

        for (const review of reviews) {
            // Check if review exists to avoid duplicates roughly
            const [exists] = await db.query(
                'SELECT id FROM reviews WHERE product_id = ? AND user_id = ? AND comment = ?',
                [review.product_id, review.user_id, review.comment]
            );

            if (exists.length === 0) {
                await db.query(
                    'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
                    [review.product_id, review.user_id, review.rating, review.comment]
                );
            }
        }

        console.log('✅ Reviews seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
        process.exit(1);
    }
};

seedReviews();
