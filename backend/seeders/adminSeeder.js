import mongoose from 'mongoose';
import adminModel from '../models/adminModel.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUsers = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database for seeding...');

        // Check if admin users already exist
        const existingAdmins = await adminModel.find({});
        
        if (existingAdmins.length > 0) {
            console.log('Admin users already exist. Skipping seeding...');
            return;
        }

        // Create default admin users
        const adminUsers = [
            {
                name: 'Super Admin',
                email: 'admin@.com',
                password: 'admin123',
                role: 'super_admin',
                isDemo: false
            },
            {
                name: 'Demo Admin',
                email: 'demo@admin.com',
                password: 'demo123',
                role: 'admin',
                isDemo: true
            }
        ];

        // Insert admin users
        const createdAdmins = await adminModel.insertMany(adminUsers);

        console.log('✅ Admin users created successfully:');
        createdAdmins.forEach(admin => {
            console.log(`- ${admin.name} (${admin.email}) - Role: ${admin.role} - Demo: ${admin.isDemo}`);
        });

        console.log('\n🔑 Default credentials:');
        console.log('Super Admin: admin@.com / admin123');
        console.log('Demo Admin: demo@admin.com / demo123');

    } catch (error) {
        console.error('❌ Error seeding admin users:', error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

// Run seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createAdminUsers();
}

export default createAdminUsers;

