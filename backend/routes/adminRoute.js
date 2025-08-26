import express from 'express';
import { adminLogin, adminLogout, getAdminProfile, createDemoAdmin } from '../controllers/adminController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);
router.post('/create-demo', createDemoAdmin);

// Protected routes
router.get('/profile', adminAuth, getAdminProfile);
router.post('/logout', adminAuth, adminLogout);

export default router;

