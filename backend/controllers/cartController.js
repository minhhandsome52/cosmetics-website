const db = require('../config/database');

// Get user's cart
const getCart = async (req, res) => {
    try {
        const [items] = await db.query(`
            SELECT ci.*, p.name, p.brand, p.price, p.image_url,
            (SELECT SUM(i.quantity) FROM inventory i 
             JOIN batches b ON i.batch_id = b.id 
             WHERE b.product_id = p.id AND b.expiry_date > CURDATE() AND b.status = 'active') as available_stock
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `, [req.user.id]);

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            success: true,
            data: {
                items,
                total,
                itemCount: items.length
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Check if product exists and has stock
        const [products] = await db.query(`
            SELECT p.*, 
            (SELECT SUM(i.quantity) FROM inventory i 
             JOIN batches b ON i.batch_id = b.id 
             WHERE b.product_id = p.id AND b.expiry_date > CURDATE() AND b.status = 'active') as available_stock
            FROM products p WHERE p.id = ? AND p.is_active = 1
        `, [product_id]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!products[0].available_stock || products[0].available_stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Not enough stock available'
            });
        }

        // Check if item already in cart
        const [existing] = await db.query(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            // Update quantity
            const newQuantity = existing[0].quantity + quantity;

            if (newQuantity > products[0].available_stock) {
                return res.status(400).json({
                    success: false,
                    message: 'Not enough stock available'
                });
            }

            await db.query(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [newQuantity, existing[0].id]
            );
        } else {
            // Add new item
            await db.query(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.user.id, product_id, quantity]
            );
        }

        res.json({
            success: true,
            message: 'Item added to cart'
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        // Verify ownership and check stock
        const [items] = await db.query(`
            SELECT ci.*, 
            (SELECT SUM(i.quantity) FROM inventory i 
             JOIN batches b ON i.batch_id = b.id 
             WHERE b.product_id = ci.product_id AND b.expiry_date > CURDATE() AND b.status = 'active') as available_stock
            FROM cart_items ci WHERE ci.id = ? AND ci.user_id = ?
        `, [id, req.user.id]);

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        if (quantity > items[0].available_stock) {
            return res.status(400).json({
                success: false,
                message: 'Not enough stock available'
            });
        }

        await db.query(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [quantity, id]
        );

        res.json({
            success: true,
            message: 'Cart updated'
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        await db.query(
            'DELETE FROM cart_items WHERE user_id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
