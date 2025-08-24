import Category from '../models/category.js';
import Subcategory from '../models/subcategory.js';

// ✅ ADD Category
export const addCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const newCategory = new Category({ name, image });
    await newCategory.save();

    res.status(201).json({ success: true, message: 'Category added successfully' });
  } catch (err) {
    console.error('Add Category Error:', err);
    res.status(500).json({ success: false, message: 'Server error while adding category' });
  }
};

// ✅ GET All Categories (now with subcategories)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate({
      path: 'subcategories',
      select: 'name image _id'
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get All Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

// ✅ UPDATE Category
export const updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const { id } = req.params;

    if (!name || !image) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { name, image },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, message: 'Category updated successfully', data: updated });
  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating category' });
  }
};

// ✅ DELETE Category (now with subcategory cleanup)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // First delete all subcategories
    await Subcategory.deleteMany({ category: id });
    
    // Then delete the category
    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, message: 'Category and its subcategories deleted successfully' });
  } catch (error) {
    console.error('Delete Category Error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting category' });
  }
};