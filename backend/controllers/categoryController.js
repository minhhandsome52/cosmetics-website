const db = require('../config/database');

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT c.*, COUNT(p.id) as product_count 
            FROM categories c 
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
            GROUP BY c.id
            ORDER BY c.name
        `);

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get category by ID with products
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const [categories] = await db.query(
            'SELECT * FROM categories WHERE id = ?',
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: categories[0]
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create category (Admin)
const createCategory = async (req, res) => {
    try {
        const { name, description, image_url } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const [result] = await db.query(
            'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
            [name, description, image_url]
        );

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { id: result.insertId, name, description, image_url }
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update category (Admin)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image_url } = req.body;

        const [result] = await db.query(
            'UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?',
            [name, description, image_url, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully'
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete category (Admin)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category has products
        const [products] = await db.query(
            'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
            [id]
        );

        if (products[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing products'
            });
        }

        const [result] = await db.query(
            'DELETE FROM categories WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
