import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import adminModel from '../models/adminModel.js';
import foodModel from '../models/foodModel.js';
import categoryModel from '../models/category.js';
import subcategoryModel from '../models/subcategory.js';
import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';
import contactModel from '../models/Contact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Create Database Backup
export const createBackup = async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup-${timestamp}.json`;
        const backupPath = path.join(backupDir, backupFileName);

        // Collect data from all collections
        const backupData = {
            timestamp: new Date().toISOString(),
            collections: {}
        };

        // Backup categories
        const categories = await categoryModel.find({});
        backupData.collections.categories = categories;

        // Backup subcategories
        const subcategories = await subcategoryModel.find({});
        backupData.collections.subcategories = subcategories;

        // Backup food items
        const foods = await foodModel.find({});
        backupData.collections.foods = foods;

        // Backup users
        const users = await userModel.find({});
        backupData.collections.users = users;

        // Backup orders
        const orders = await orderModel.find({});
        backupData.collections.orders = orders;

        // Backup contacts
        const contacts = await contactModel.find({});
        backupData.collections.contacts = contacts;

        // Write backup to file
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

        res.status(200).json({
            success: true,
            message: 'Backup created successfully',
            data: {
                fileName: backupFileName,
                fileSize: fs.statSync(backupPath).size,
                timestamp: backupData.timestamp,
                collections: Object.keys(backupData.collections)
            }
        });

    } catch (error) {
        console.error('Backup creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create backup',
            error: error.message
        });
    }
};

// List all available backups
export const listBackups = async (req, res) => {
    try {
        const files = fs.readdirSync(backupDir);
        const backups = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(backupDir, file);
                const stats = fs.statSync(filePath);
                return {
                    fileName: file,
                    fileSize: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime
                };
            })
            .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

        res.status(200).json({
            success: true,
            data: backups
        });

    } catch (error) {
        console.error('List backups error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list backups',
            error: error.message
        });
    }
};

// Restore Database from Backup
export const restoreBackup = async (req, res) => {
    try {
        const { fileName } = req.body;

        if (!fileName) {
            return res.status(400).json({
                success: false,
                message: 'Backup file name is required'
            });
        }

        const backupPath = path.join(backupDir, fileName);
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup file not found'
            });
        }

        // Read backup file
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Clear existing data
            await categoryModel.deleteMany({}, { session });
            await subcategoryModel.deleteMany({}, { session });
            await foodModel.deleteMany({}, { session });
            await userModel.deleteMany({}, { session });
            await orderModel.deleteMany({}, { session });
            await contactModel.deleteMany({}, { session });

            // Restore data
            if (backupData.collections.categories) {
                await categoryModel.insertMany(backupData.collections.categories, { session });
            }

            if (backupData.collections.subcategories) {
                await subcategoryModel.insertMany(backupData.collections.subcategories, { session });
            }

            if (backupData.collections.foods) {
                await foodModel.insertMany(backupData.collections.foods, { session });
            }

            if (backupData.collections.users) {
                await userModel.insertMany(backupData.collections.users, { session });
            }

            if (backupData.collections.orders) {
                await orderModel.insertMany(backupData.collections.orders, { session });
            }

            if (backupData.collections.contacts) {
                await contactModel.insertMany(backupData.collections.contacts, { session });
            }

            await session.commitTransaction();

            res.status(200).json({
                success: true,
                message: 'Database restored successfully from backup',
                data: {
                    fileName,
                    restoredAt: new Date().toISOString(),
                    collections: Object.keys(backupData.collections)
                }
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Backup restoration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore backup',
            error: error.message
        });
    }
};

// Delete Backup File
export const deleteBackup = async (req, res) => {
    try {
        const { fileName } = req.params;

        const backupPath = path.join(backupDir, fileName);
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup file not found'
            });
        }

        fs.unlinkSync(backupPath);

        res.status(200).json({
            success: true,
            message: 'Backup file deleted successfully',
            data: { fileName }
        });

    } catch (error) {
        console.error('Delete backup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete backup',
            error: error.message
        });
    }
};

