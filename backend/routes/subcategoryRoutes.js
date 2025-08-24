import express from 'express';
import {
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoriesByCategory,
  getAllSubcategories
} from '../controllers/subcategoryController.js';

const router = express.Router();

router.post('/add', addSubcategory);
router.put('/update/:id', updateSubcategory);
router.delete('/delete/:id', deleteSubcategory);
router.get('/by-category/:categoryId', getSubcategoriesByCategory);
router.get('/all', getAllSubcategories);

export default router;