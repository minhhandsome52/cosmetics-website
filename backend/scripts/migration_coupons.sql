USE cosmetics_db;

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percent', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_uses INT DEFAULT 100,
    used_count INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add coupon columns to orders table
-- Using PROCEDURE to add columns only if they don't exist
DROP PROCEDURE IF EXISTS AddCouponColumns;
DELIMITER //
CREATE PROCEDURE AddCouponColumns()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'cosmetics_db' 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'coupon_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN coupon_id INT NULL;
        ALTER TABLE orders ADD CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id);
    END IF;

    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'cosmetics_db' 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'discount_amount'
    ) THEN
        ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
END //
DELIMITER ;

CALL AddCouponColumns();
DROP PROCEDURE AddCouponColumns;

-- Insert sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, start_date, end_date) VALUES
('WELCOME10', 'percent', 10, 0, 1000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR)),
('SALE50K', 'fixed', 50000, 500000, 100, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH)),
('SUMMER2026', 'percent', 15, 300000, 50, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 MONTH));

SELECT 'Coupons table created and seeded successfully' as Result;
