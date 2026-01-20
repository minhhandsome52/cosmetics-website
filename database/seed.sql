-- =============================================
-- COSMETICS E-COMMERCE SEED DATA
-- =============================================

-- =============================================
-- INSERT USERS (password: 123456 - hashed with bcrypt)
-- =============================================
INSERT INTO users (name, email, password, phone, address, role) VALUES
('Admin', 'admin@mypham.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234567', 'Hà Nội, Việt Nam', 'admin'),
('Nguyễn Văn A', 'nguyenvana@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0912345678', '123 Lê Lợi, Quận 1, TP.HCM', 'customer'),
('Trần Thị B', 'tranthib@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0923456789', '456 Nguyễn Huệ, Quận 1, TP.HCM', 'customer');

-- =============================================
-- INSERT CATEGORIES
-- =============================================
INSERT INTO categories (name, description, image_url) VALUES
('Chăm sóc da', 'Các sản phẩm chăm sóc da mặt: sữa rửa mặt, toner, serum, kem dưỡng,...', '/images/categories/skincare.jpg'),
('Trang điểm', 'Các sản phẩm makeup: son, phấn, mascara, eyeliner,...', '/images/categories/makeup.jpg'),
('Chăm sóc tóc', 'Dầu gội, dầu xả, ủ tóc, tinh dầu dưỡng tóc,...', '/images/categories/haircare.jpg'),
('Nước hoa', 'Nước hoa nam, nữ từ các thương hiệu nổi tiếng', '/images/categories/perfume.jpg'),
('Chăm sóc cơ thể', 'Sữa tắm, dưỡng thể, kem chống nắng,...', '/images/categories/bodycare.jpg');

-- =============================================
-- INSERT PRODUCTS
-- =============================================
INSERT INTO products (category_id, name, brand, description, ingredients, usage_instructions, price, image_url) VALUES
-- Chăm sóc da
(1, 'Serum Vitamin C 20%', 'La Roche-Posay', 'Serum vitamin C nguyên chất giúp làm sáng da, mờ thâm và chống oxy hóa hiệu quả.', 'Ascorbic Acid, Vitamin E, Hyaluronic Acid, Ferulic Acid', 'Sử dụng 4-5 giọt vào buổi sáng sau khi làm sạch da. Thoa đều lên mặt và cổ.', 850000, '/images/products/serum-vitamin-c.jpg'),
(1, 'Kem dưỡng ẩm Hydra Boost', 'Neutrogena', 'Kem dưỡng ẩm cấp nước tức thì với Hyaluronic Acid, giúp da căng mọng suốt 48 giờ.', 'Hyaluronic Acid, Glycerin, Dimethicone', 'Thoa đều lên mặt và cổ sau bước toner, sáng và tối.', 320000, '/images/products/hydra-boost.jpg'),
(1, 'Sữa rửa mặt Gentle Cleanser', 'Cetaphil', 'Sữa rửa mặt dịu nhẹ cho mọi loại da, không gây khô căng.', 'Water, Cetyl Alcohol, Propylene Glycol, Sodium Lauryl Sulfate', 'Massage nhẹ nhàng lên da ướt, sau đó rửa sạch với nước.', 195000, '/images/products/gentle-cleanser.jpg'),
(1, 'Toner không cồn Rose Water', 'Mamonde', 'Toner hoa hồng Damask giúp cân bằng độ pH và làm dịu da.', 'Rose Water, Glycerin, Niacinamide', 'Thấm toner lên bông cotton và lau nhẹ khắp mặt sau khi rửa mặt.', 280000, '/images/products/rose-toner.jpg'),
-- Trang điểm
(2, 'Son môi Velvet Red', 'MAC', 'Son lì màu đỏ cổ điển, lên màu chuẩn và giữ màu lâu.', 'Castor Oil, Beeswax, Carmine, Vitamin E', 'Thoa trực tiếp lên môi. Có thể dùng chổi để tạo viền môi sắc nét.', 520000, '/images/products/velvet-red.jpg'),
(2, 'Cushion Foundation SPF50', 'Laneige', 'Phấn nước che phủ tự nhiên, kiềm dầu và chống nắng.', 'Titanium Dioxide, Zinc Oxide, Niacinamide, Hyaluronic Acid', 'Dùng puff vỗ nhẹ sản phẩm lên da mặt từ trong ra ngoài.', 750000, '/images/products/cushion.jpg'),
(2, 'Mascara Volume Express', 'Maybelline', 'Mascara làm dày mi gấp 10 lần, không vón cục.', 'Beeswax, Carnauba Wax, Iron Oxide', 'Chải đều từ chân đến ngọn mi. Có thể chải 2-3 lớp.', 185000, '/images/products/mascara.jpg'),
-- Chăm sóc tóc
(3, 'Dầu gội phục hồi Keratin', 'TRESemmé', 'Dầu gội chứa Keratin giúp phục hồi tóc hư tổn.', 'Keratin, Argan Oil, Vitamin B5', 'Cho một lượng vừa đủ lên tóc ướt, massage và xả sạch.', 145000, '/images/products/keratin-shampoo.jpg'),
(3, 'Tinh dầu dưỡng tóc Argan', 'Moroccanoil', 'Tinh dầu Argan nguyên chất giúp tóc mềm mượt và bóng khỏe.', 'Argan Oil, Linseed Oil, Vitamin E', 'Xịt hoặc thoa đều lên tóc ẩm hoặc khô, tập trung vào phần ngọn.', 890000, '/images/products/argan-oil.jpg'),
-- Nước hoa
(4, 'Nước hoa Miss Dior', 'Dior', 'Hương hoa cỏ thanh lịch với nốt hương hoa hồng và mẫu đơn.', 'Alcohol, Parfum, Rosa Damascena, Peony', 'Xịt lên các điểm mạch: cổ tay, sau tai, cổ.', 2850000, '/images/products/miss-dior.jpg'),
(4, 'Nước hoa Bleu de Chanel', 'Chanel', 'Hương nam tính với nốt gỗ và cam bergamot.', 'Alcohol, Parfum, Cedarwood, Bergamot, Mint', 'Xịt cách cơ thể 15-20cm lên ngực, cổ.', 3200000, '/images/products/bleu-chanel.jpg'),
-- Chăm sóc cơ thể
(5, 'Kem chống nắng UV Expert SPF50+', 'La Roche-Posay', 'Kem chống nắng phổ rộng, không gây nhờn rít.', 'Titanium Dioxide, Zinc Oxide, Vitamin E, Glycerin', 'Thoa đều lên da 15-20 phút trước khi ra nắng. Thoa lại sau 2 giờ.', 450000, '/images/products/sunscreen.jpg'),
(5, 'Sữa dưỡng thể Shea Butter', 'The Body Shop', 'Sữa dưỡng thể với bơ hạt mỡ giúp da mềm mịn suốt 24 giờ.', 'Shea Butter, Cocoa Butter, Vitamin E', 'Thoa đều lên cơ thể sau khi tắm khi da còn ẩm.', 380000, '/images/products/body-lotion.jpg');

-- =============================================
-- INSERT BATCHES (Lô hàng)
-- =============================================
INSERT INTO batches (product_id, batch_number, manufacture_date, expiry_date, initial_quantity, status) VALUES
-- Serum Vitamin C - Các lô khác nhau
(1, 'LOT-VC-001', '2025-06-01', '2027-06-01', 100, 'active'),
(1, 'LOT-VC-002', '2025-09-15', '2027-09-15', 150, 'active'),
-- Kem dưỡng ẩm
(2, 'LOT-HB-001', '2025-05-10', '2027-05-10', 200, 'active'),
-- Sữa rửa mặt - có lô sắp hết hạn
(3, 'LOT-GC-001', '2024-01-01', '2026-02-01', 80, 'active'),  -- Sắp hết hạn (trong 30 ngày)
(3, 'LOT-GC-002', '2025-08-01', '2027-08-01', 120, 'active'),
-- Toner - có lô đã hết hạn
(4, 'LOT-TN-001', '2023-06-01', '2025-06-01', 50, 'expired'),  -- Đã hết hạn
(4, 'LOT-TN-002', '2025-10-01', '2027-10-01', 100, 'active'),
-- Son môi
(5, 'LOT-SM-001', '2025-07-01', '2028-07-01', 300, 'active'),
-- Cushion
(6, 'LOT-CS-001', '2025-08-01', '2027-08-01', 150, 'active'),
-- Mascara
(7, 'LOT-MC-001', '2025-09-01', '2026-09-01', 200, 'active'),
-- Dầu gội
(8, 'LOT-DG-001', '2025-06-01', '2027-06-01', 250, 'active'),
-- Tinh dầu dưỡng tóc
(9, 'LOT-TD-001', '2025-07-15', '2028-07-15', 80, 'active'),
-- Nước hoa Miss Dior
(10, 'LOT-MD-001', '2025-01-01', '2030-01-01', 50, 'active'),
-- Nước hoa Bleu de Chanel
(11, 'LOT-BC-001', '2025-03-01', '2030-03-01', 40, 'active'),
-- Kem chống nắng - có lô sắp hết hạn
(12, 'LOT-CN-001', '2024-02-01', '2026-02-10', 100, 'active'),  -- Sắp hết hạn
(12, 'LOT-CN-002', '2025-10-01', '2027-10-01', 150, 'active'),
-- Sữa dưỡng thể
(13, 'LOT-DT-001', '2025-08-01', '2027-08-01', 180, 'active');

-- =============================================
-- INSERT INVENTORY (Tồn kho)
-- =============================================
INSERT INTO inventory (batch_id, quantity) VALUES
(1, 85),   -- LOT-VC-001
(2, 150),  -- LOT-VC-002
(3, 180),  -- LOT-HB-001
(4, 25),   -- LOT-GC-001 (sắp hết hạn)
(5, 120),  -- LOT-GC-002
(6, 0),    -- LOT-TN-001 (đã hết hạn - hết hàng)
(7, 95),   -- LOT-TN-002
(8, 280),  -- LOT-SM-001
(9, 140),  -- LOT-CS-001
(10, 185), -- LOT-MC-001
(11, 230), -- LOT-DG-001
(12, 75),  -- LOT-TD-001
(13, 48),  -- LOT-MD-001
(14, 38),  -- LOT-BC-001
(15, 45),  -- LOT-CN-001 (sắp hết hạn)
(16, 150), -- LOT-CN-002
(17, 165); -- LOT-DT-001

-- =============================================
-- INSERT SAMPLE CART ITEMS
-- =============================================
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(2, 1, 2),  -- Nguyễn Văn A - 2 Serum Vitamin C
(2, 5, 1),  -- Nguyễn Văn A - 1 Son môi
(3, 10, 1); -- Trần Thị B - 1 Nước hoa Miss Dior

-- =============================================
-- INSERT SAMPLE ORDERS
-- =============================================
INSERT INTO orders (user_id, total_amount, shipping_address, phone, status) VALUES
(2, 1370000, '123 Lê Lợi, Quận 1, TP.HCM', '0912345678', 'delivered'),
(3, 3230000, '456 Nguyễn Huệ, Quận 1, TP.HCM', '0923456789', 'shipping');

-- =============================================
-- INSERT SAMPLE ORDER ITEMS
-- =============================================
INSERT INTO order_items (order_id, product_id, batch_id, quantity, unit_price) VALUES
(1, 1, 1, 1, 850000),   -- Serum Vitamin C
(1, 5, 8, 1, 520000),   -- Son môi
(2, 11, 14, 1, 3200000), -- Nước hoa Bleu de Chanel
(2, 4, 7, 1, 280000);    -- Toner (lô còn hạn) - nhưng total không khớp, sẽ fix

-- Fix order total
UPDATE orders SET total_amount = 3480000 WHERE id = 2;

-- =============================================
-- INSERT SAMPLE COUPONS
-- =============================================
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, start_date, end_date) VALUES
('WELCOME10', 'percent', 10, 0, 1000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR)),
('SALE50K', 'fixed', 50000, 500000, 100, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH)),
('SUMMER2026', 'percent', 15, 300000, 50, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 MONTH));

