import express from 'express';
import {
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.post('/add', addCategory);
router.get('/all', getAllCategories);
router.put('/update/:id', updateCategory);   // 👈 Edit
router.delete('/delete/:id', deleteCategory); // 👈 Delete

export default router;
