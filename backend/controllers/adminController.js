import adminModel from '../models/adminModel.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '30d',
    });
};

// Admin Login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        const token = generateToken(admin._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isDemo: admin.isDemo
            },
            token
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get Admin Profile
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await adminModel.findById(req.adminId).select('-password');
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            data: admin
        });

    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Admin Logout
export const adminLogout = async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just send a success response
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Admin logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create Demo Admin (for testing purposes)
export const createDemoAdmin = async (req, res) => {
    try {
        const demoAdmin = new adminModel({
            name: 'Demo Admin',
            email: 'demo@admin.com',
            password: 'demo123',
            role: 'admin',
            isDemo: true
        });

        await demoAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Demo admin created successfully',
            data: {
                _id: demoAdmin._id,
                name: demoAdmin.name,
                email: demoAdmin.email,
                role: demoAdmin.role,
                isDemo: demoAdmin.isDemo
            }
        });

    } catch (error) {
        console.error('Create demo admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

