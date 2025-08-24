import foodModel from '../models/foodModel.js';

// Add food item
const addFood = async (req, res) => {
    const { name, description, price, category, subcategory, image } = req.body;

    try {
        const food = new foodModel({
            name,
            description,
            price,
            category,
            subcategory,
            image
        });

        await food.save();
        res.json({ success: true, message: 'Product Added', data: food });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error adding food' });
    }
};

// All food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
            .populate('category', 'name')
            .populate('subcategory', 'name');
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error fetching food list' });
    }
};

const removeFood = async (req, res) => {
    try {
        const deletedFood = await foodModel.findByIdAndDelete(req.body.id);
        if (!deletedFood) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product Removed' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error removing Product' });
    }
};

export { addFood, listFood, removeFood };