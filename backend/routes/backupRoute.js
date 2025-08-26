import express from 'express';
import { createBackup, listBackups, restoreBackup, deleteBackup } from '../controllers/backupController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// All backup routes require admin authentication
router.use(adminAuth);

// Create new backup
router.post('/create', createBackup);

// List all backups
router.get('/list', listBackups);

// Restore from backup
router.post('/restore', restoreBackup);

// Delete backup file
router.delete('/delete/:fileName', deleteBackup);

export default router;

