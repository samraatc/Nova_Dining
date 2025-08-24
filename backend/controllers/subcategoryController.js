import Subcategory from '../models/subcategory.js';
import Category from '../models/category.js';

// ✅ ADD Subcategory
export const addSubcategory = async (req, res) => {
  try {
    const { name, image, category } = req.body;

    if (!name || !image || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parent category not found' 
      });
    }

    const exists = await Subcategory.findOne({ name, category });
    if (exists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subcategory already exists in this category' 
      });
    }

    const newSubcategory = new Subcategory({ name, image, category });
    await newSubcategory.save();

    await Category.findByIdAndUpdate(
      category,
      { $push: { subcategories: newSubcategory._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Subcategory added successfully',
      data: newSubcategory
    });
  } catch (err) {
    console.error('Add Subcategory Error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding subcategory' 
    });
  }
};


// ✅ UPDATE Subcategory
export const updateSubcategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const { id } = req.params;

    if (!name || !image) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const updated = await Subcategory.findByIdAndUpdate(
      id,
      { name, image },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Subcategory updated successfully', 
      data: updated 
    });
  } catch (error) {
    console.error('Update Subcategory Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating subcategory' 
    });
  }
};

// ✅ DELETE Subcategory
export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    // First get the subcategory to know its parent
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    // Remove from parent category's subcategories array
    await Category.findByIdAndUpdate(
      subcategory.category,
      { $pull: { subcategories: id } }
    );

    // Then delete the subcategory
    await Subcategory.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: 'Subcategory deleted successfully' 
    });
  } catch (error) {
    console.error('Delete Subcategory Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting subcategory' 
    });
  }
};

// ✅ GET Subcategories by Category
export const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const subcategories = await Subcategory.find({ category: categoryId });
    
    res.status(200).json({ 
      success: true, 
      data: subcategories 
    });
  } catch (error) {
    console.error('Get Subcategories Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching subcategories' 
    });
  }
};

// ✅ GET All Subcategories
export const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate('category', 'name');
    
    res.status(200).json({ 
      success: true, 
      data: subcategories 
    });
  } catch (error) {
    console.error('Get All Subcategories Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching all subcategories' 
    });
  }
};