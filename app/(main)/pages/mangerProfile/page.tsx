'use client';
import React, { useContext, useState, useEffect } from 'react';
import { updateProfile } from "firebase/auth";
import { LayoutContext } from '@/layout/context/layoutcontext';

// PrimeReact Components
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';

const ProfileEdit = () => {
    const { currentUser } = useContext(LayoutContext);

    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ severity: any, summary: string } | null>(null);

    // Sync initial state
    useEffect(() => {
        if (currentUser?.displayName) {
            setDisplayName(currentUser.displayName);
        }
    }, [currentUser]);

    const handleUpdateName = async () => {
        if (!currentUser) return;
        if (displayName.trim() === "") {
            setStatus({ severity: 'error', summary: 'Name cannot be empty' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            // Updating the Auth node directly
            await updateProfile(currentUser, {
                displayName: displayName
            });

            setStatus({ severity: 'success', summary: 'Name updated successfully!' });

            // Clear message after 3 seconds
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            console.error("Update Error:", error);
            setStatus({ severity: 'error', summary: 'Update failed. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card flex justify-content-center p-4">
            <div className="surface-card p-5 shadow-2 border-round-xl w-full lg:w-6" style={{ maxWidth: '500px' }}>
                <div className="text-center mb-5">
                    {/* Visual Profile Header */}
                    <div className="relative inline-block mb-3">
                        <Avatar
                            label={currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                            size="xlarge"
                            shape="circle"
                            className="bg-primary text-white text-3xl shadow-3"
                            style={{ width: '80px', height: '80px' }}
                        />
                    </div>
                    <div className="text-900 text-2xl font-medium mb-1">Account Settings</div>
                    <span className="text-500 font-medium">Update your public profile information</span>
                </div>

                <Divider />

                <div className="grid p-fluid">
                    {/* Display Name Field */}
                    <div className="col-12 mb-4">
                        <label htmlFor="name" className="block text-900 font-medium mb-2">Display Name</label>
                        <span className="p-input-icon-left">
                            <i className="pi pi-user" />
                            <InputText
                                id="name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your full name"
                                className={classNames({ 'p-invalid': !displayName })}
                            />
                        </span>
                    </div>

                    {/* Read-Only Email Field */}
                    <div className="col-12 mb-4">
                        <label htmlFor="email" className="block text-500 font-medium mb-2">Email Address (Primary)</label>
                        <span className="p-input-icon-left">
                            <i className="pi pi-envelope" />
                            <InputText
                                id="email"
                                value={currentUser?.email || ''}
                                disabled
                                className="bg-gray-100 opacity-60"
                            />
                        </span>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="col-12 mb-3 animate-fadein">
                            <Message severity={status.severity} text={status.summary} className="w-full justify-content-start" />
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="col-12">
                        <Button
                            label="Save Changes"
                            icon="pi pi-check"
                            loading={loading}
                            onClick={handleUpdateName}
                            className="p-button-raised p-button-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileEdit;
