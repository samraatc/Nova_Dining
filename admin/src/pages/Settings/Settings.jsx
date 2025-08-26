import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Settings.css';
import { assets } from '../../assets/assets';

const Settings = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creatingBackup, setCreatingBackup] = useState(false);

    const adminToken = localStorage.getItem('adminToken');

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/backup/list', {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setBackups(data.data);
            }
        } catch (error) {
            console.error('Error fetching backups:', error);
        }
    };

    const createBackup = async () => {
        setCreatingBackup(true);
        try {
            const response = await fetch('http://localhost:5000/api/backup/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Backup created successfully!');
                fetchBackups(); // Refresh the list
            } else {
                toast.error(data.message || 'Failed to create backup');
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            toast.error('Failed to create backup');
        } finally {
            setCreatingBackup(false);
        }
    };

    const restoreBackup = async (fileName) => {
        if (!window.confirm(`Are you sure you want to restore from backup: ${fileName}? This will overwrite all current data!`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/backup/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ fileName })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Database restored successfully!');
            } else {
                toast.error(data.message || 'Failed to restore backup');
            }
        } catch (error) {
            console.error('Error restoring backup:', error);
            toast.error('Failed to restore backup');
        } finally {
            setLoading(false);
        }
    };

    const deleteBackup = async (fileName) => {
        if (!window.confirm(`Are you sure you want to delete backup: ${fileName}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/backup/delete/${fileName}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Backup deleted successfully!');
                fetchBackups(); // Refresh the list
            } else {
                toast.error(data.message || 'Failed to delete backup');
            }
        } catch (error) {
            console.error('Error deleting backup:', error);
            toast.error('Failed to delete backup');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2>Settings</h2>
                <p>Manage your system settings and database backups</p>
            </div>

            <div className="settings-section">
                <h3>Database Backup</h3>
                <p>Create and manage database backups to protect your data.</p>
                
                <button 
                    className="create-backup-btn"
                    onClick={createBackup}
                    disabled={creatingBackup}
                >
                    {creatingBackup ? 'Creating Backup...' : 'Create New Backup'}
                </button>

                <div className="backups-list">
                    <h4>Available Backups</h4>
                    {backups.length === 0 ? (
                        <p className="no-backups">No backups available</p>
                    ) : (
                        <div className="backups-grid">
                            {backups.map((backup, index) => (
                                <div key={index} className="backup-item">
                                    <div className="backup-info">
                                        <h5>{backup.fileName}</h5>
                                        <p>Size: {formatFileSize(backup.fileSize)}</p>
                                        <p>Created: {formatDate(backup.createdAt)}</p>
                                    </div>
                                    <div className="backup-actions">
                                        <button 
                                            className="restore-btn"
                                            onClick={() => restoreBackup(backup.fileName)}
                                            disabled={loading}
                                        >
                                            {loading ? 'Restoring...' : 'Restore'}
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => deleteBackup(backup.fileName)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="settings-section">
                <h3>System Information</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Admin Panel Version:</span>
                        <span className="info-value">1.0.0</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Last Backup:</span>
                        <span className="info-value">
                            {backups.length > 0 ? formatDate(backups[0].createdAt) : 'Never'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Total Backups:</span>
                        <span className="info-value">{backups.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

