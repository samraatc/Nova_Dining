# Nova Dining Admin Panel Setup

This document provides setup instructions for the new admin features added to the Nova Dining project.

## New Features Added

1. **Admin Authentication System**
   - Login/logout functionality
   - JWT token-based authentication
   - Protected admin routes

2. **Demo Admin Account**
   - Demo admin with limited access
   - Changes don't affect the main database
   - Perfect for testing and demonstrations

3. **Database Backup System**
   - Create database backups
   - Restore from backups
   - Manage backup files
   - Accessible through Settings page

4. **Settings Page**
   - Database backup management
   - System information display
   - Backup creation and restoration

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

3. **Run Admin Seeder**
   ```bash
   npm run seed
   ```
   This will create default admin accounts:
   - **Demo Admin**: demo@admin.com / demo123

4. **Start Backend Server**
   ```bash
   npm run server
   ```

### Frontend (Admin Panel) Setup

1. **Install Dependencies**
   ```bash
   cd admin
   npm install
   ```

2. **Start Admin Panel**
   ```bash
   npm run dev
   ```

3. **Access Admin Panel**
   - Navigate to the admin panel URL
   - You'll be redirected to the login page
   - Use the credentials from the seeder

## API Endpoints

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile` - Get admin profile

### Database Backup
- `POST /api/backup/create` - Create new backup
- `GET /api/backup/list` - List all backups
- `POST /api/backup/restore` - Restore from backup
- `DELETE /api/backup/delete/:fileName` - Delete backup file

## Usage

### Login
1. Access the admin panel
2. Enter your credentials
3. You'll be redirected to the dashboard

### Creating Backups
1. Navigate to Settings → Database Backup
2. Click "Create New Backup"
3. Wait for the backup to complete

### Restoring Backups
1. Go to Settings → Database Backup
2. Find the backup you want to restore
3. Click "Restore" button
4. Confirm the action

### Demo Admin
- The demo admin account is perfect for testing
- All changes made by demo admin are isolated
- Use this account for demonstrations and training

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected admin routes
- Session management
- Secure backup operations

## File Structure

```
backend/
├── models/
│   └── adminModel.js          # Admin user model
├── controllers/
│   ├── adminController.js     # Admin authentication
│   └── backupController.js    # Database backup operations
├── middleware/
│   └── adminAuth.js          # Admin authentication middleware
├── routes/
│   ├── adminRoute.js         # Admin routes
│   └── backupRoute.js        # Backup routes
└── seeders/
    └── adminSeeder.js        # Admin user seeder

admin/
├── src/
│   ├── pages/
│   │   ├── Login/            # Login page
│   │   └── Settings/         # Settings page with backup
│   └── components/
│       ├── Navbar/           # Updated navbar with logout
│       └── Sidebar/          # Updated sidebar with settings
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check if the backend server is running
   - Verify the JWT_SECRET in .env
   - Ensure the admin seeder has been run

2. **Backup Creation Failed**
   - Check file permissions for the backups directory
   - Ensure MongoDB connection is stable
   - Verify admin authentication

3. **Login Not Working**
   - Clear browser localStorage
   - Check browser console for errors
   - Verify API endpoint URLs

### Support

For additional support or questions, please refer to the project documentation or contact the development team.

## Notes

- The demo admin account is automatically created when running the seeder
- Backup files are stored in the `backend/backups/` directory
- All admin operations require valid authentication
- The system automatically handles token expiration

