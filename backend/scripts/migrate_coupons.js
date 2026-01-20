const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        console.log('🚀 Starting Coupon Migration...');

        const sqlPath = path.join(__dirname, 'migration_coupons.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split commands by semicolon, but be careful with DELIMITER
        // Since my SQL script uses DELIMITER, it's safer to execute it as a whole block if the driver supports it, 
        // or simplistic splitting might fail on procedures.
        // However, standard mysql2 driver query() handles multiple statements if 'multipleStatements: true' is set in connection config.
        // Let's check db config first, or just try to Execute.

        // Simpler approach for this specific script:
        // 1. Create table
        // 2. Insert data
        // The procedure part is tricky with simple splitting. 
        // Let's rely on the fact that allowMultipleStatements is often enabled or we can just send the raw text if supported.

        // Actually, db.query might process multiple statements if enabled.
        // Let's try to enable it explicitly or just rewrite the migration script to be JS-based which is safer.

        // Rewriting logic to JS for safety/compatibility

        // 1. Create Table
        await db.query(`
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
            )
        `);
        console.log('✅ Coupons table created/checked');

        // 2. Add Columns to Orders (Manual check to avoid Procedure complexity)
        try {
            await db.query(`ALTER TABLE orders ADD COLUMN coupon_id INT NULL`);
            await db.query(`ALTER TABLE orders ADD CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id)`);
            console.log('✅ Added coupon_id to orders');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('ℹ️ coupon_id column likely exists');
        }

        try {
            await db.query(`ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0`);
            console.log('✅ Added discount_amount to orders');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('ℹ️ discount_amount column likely exists');
        }

        // 3. Insert specific sample coupons (using INSERT IGNORE or ON DUPLICATE KEY UPDATE)
        const coupons = [
            ['WELCOME10', 'percent', 10, 0, 1000, new Date(), new Date(new Date().setFullYear(new Date().getFullYear() + 1))],
            ['SALE50K', 'fixed', 50000, 500000, 100, new Date(), new Date(new Date().setMonth(new Date().getMonth() + 1))],
            ['SUMMER2026', 'percent', 15, 300000, 50, new Date(), new Date(new Date().setMonth(new Date().getMonth() + 3))]
        ];

        for (const [code, type, val, min, max, start, end] of coupons) {
            await db.query(`
                INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, start_date, end_date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE max_uses = VALUES(max_uses)
             `, [code, type, val, min, max, start, end]);
        }
        console.log('✅ Sample coupons seeded');

        console.log('🎉 Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
