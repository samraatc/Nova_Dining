import express from 'express';
import { submitContactForm, getAllContacts } from '../controllers/contactController.js';

const router = express.Router();

router.post('/submit', submitContactForm);
router.get('/', getAllContacts); // Add this new route

export default router;