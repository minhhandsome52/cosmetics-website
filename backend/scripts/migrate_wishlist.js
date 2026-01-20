const db = require('../config/database');

// Run: node backend/scripts/migrate_wishlist.js

async function migrateWishlist() {
    console.log('Starting wishlist migration...');

    try {
        // Check if table already exists
        const [tables] = await db.query("SHOW TABLES LIKE 'wishlist'");

        if (tables.length > 0) {
            console.log('✓ Wishlist table already exists');
        } else {
            // Create wishlist table
            await db.query(`
                CREATE TABLE wishlist (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    product_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_wishlist (user_id, product_id)
                )
            `);
            console.log('✓ Created wishlist table');

            // Create index
            await db.query('CREATE INDEX idx_wishlist_user ON wishlist(user_id)');
            console.log('✓ Created index');
        }

        console.log('\n✅ Wishlist migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrateWishlist();
