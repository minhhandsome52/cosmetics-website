const db = require('../config/database');

// Get all products with filters
const getAllProducts = async (req, res) => {
    try {
        const { category_id, brand, search, sort, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, c.name as category_name,
            (SELECT SUM(i.quantity) FROM inventory i 
             JOIN batches b ON i.batch_id = b.id 
             WHERE b.product_id = p.id AND b.expiry_date > CURDATE() AND b.status = 'active') as stock,
            (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
            (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1
        `;
        const params = [];

        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(category_id);
        }

        if (brand) {
            query += ' AND p.brand LIKE ?';
            params.push(`%${brand}%`);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Count total
        const countQuery = query.replace(
            /SELECT p\.\*, c\.name as category_name,[\s\S]*?FROM products p/,
            'SELECT COUNT(*) as total FROM products p'
        );
        const [countResult] = await db.query(countQuery, params);
        const total = countResult[0].total;

        // Add sorting
        switch (sort) {
            case 'price_asc':
                query += ' ORDER BY p.price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY p.price DESC';
                break;
            case 'name_asc':
                query += ' ORDER BY p.name ASC';
                break;
            case 'newest':
                query += ' ORDER BY p.created_at DESC';
                break;
            default:
                query += ' ORDER BY p.id DESC';
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [products] = await db.query(query, params);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get product by ID with stock info
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.query(`
            SELECT p.*, c.name as category_name,
            (SELECT SUM(i.quantity) FROM inventory i 
             JOIN batches b ON i.batch_id = b.id 
             WHERE b.product_id = p.id AND b.expiry_date > CURDATE() AND b.status = 'active') as stock,
            (SELECT MIN(b.expiry_date) FROM batches b 
             JOIN inventory i ON b.id = i.batch_id
             WHERE b.product_id = p.id AND b.expiry_date > CURDATE() AND b.status = 'active' AND i.quantity > 0) as nearest_expiry,
            (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
            (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: products[0]
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get featured products (for homepage)
const getFeaturedProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, c.name as category_name,
            (SELECT SUM(i.quantity) FROM inventory i 
             JOIN batches b ON i.batch_id = b.id 
             WHERE b.product_id = p.id AND b.expiry_date > CURDATE() AND b.status = 'active') as stock,
            (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) as avg_rating,
            (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1
            ORDER BY p.created_at DESC
            LIMIT 8
        `);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create product (Admin)
const createProduct = async (req, res) => {
    try {
        const { category_id, name, brand, description, ingredients, usage_instructions, price, image_url } = req.body;

        if (!category_id || !name || !brand || !price) {
            return res.status(400).json({
                success: false,
                message: 'Category, name, brand and price are required'
            });
        }

        const [result] = await db.query(
            `INSERT INTO products (category_id, name, brand, description, ingredients, usage_instructions, price, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [category_id, name, brand, description, ingredients, usage_instructions, price, image_url]
        );

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update product (Admin)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, name, brand, description, ingredients, usage_instructions, price, image_url, is_active } = req.body;

        const [result] = await db.query(
            `UPDATE products SET category_id = ?, name = ?, brand = ?, description = ?, 
             ingredients = ?, usage_instructions = ?, price = ?, image_url = ?, is_active = ?
             WHERE id = ?`,
            [category_id, name, brand, description, ingredients, usage_instructions, price, image_url, is_active, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete product (Admin)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete by setting is_active to false
        const [result] = await db.query(
            'UPDATE products SET is_active = 0 WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get all brands (for filter)
const getAllBrands = async (req, res) => {
    try {
        const [brands] = await db.query(
            'SELECT DISTINCT brand FROM products WHERE is_active = 1 ORDER BY brand'
        );

        res.json({
            success: true,
            data: brands.map(b => b.brand)
        });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllBrands
};
