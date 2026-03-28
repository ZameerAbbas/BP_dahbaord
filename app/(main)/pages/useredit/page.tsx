'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { UserType } from '../users/page';
import { updateUser } from '@/firebaseUtils';

export default function UserEditPage() {
    const router = useRouter();

    const [user, setUser] = useState<UserType>({
        uid: '',
        email: '',
        displayName: '',
        isAccepted: false,
        isAdmin: false,
        createdAt: '',
        bpPassword: '',
        bpUsername: '',
        phoneNumber: '',
        updatedAt: null
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = localStorage.getItem('userData');

        if (data) {
            setUser(JSON.parse(data));
        }

        setLoading(false);
    }, []);

    const handleChange = (field: keyof UserType, value: any) => {
        setUser(prev => ({ ...prev, [field]: value }));
    };

    const saveHandle = async () => {
        const { uid, ...updates } = user;

        await updateUser(uid, updates);

        // ✅ clear storage
        localStorage.removeItem('userData');

        // ✅ redirect back
        router.push('/pages/users');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card">
            <h2 className="mb-4">Edit User</h2>

            {/* ✅ 2 Column Grid */}
            <div className="grid formgrid">

                {/* LEFT COLUMN */}
                <div className="col-12 md:col-6">
                    <label>Name</label>
                    <InputText
                        value={user.displayName}
                        onChange={(e) => handleChange('displayName', e.target.value)}
                        className="w-full mb-3"
                    />

                    <label>Email</label>
                    <InputText
                        value={user.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full mb-3"
                    />

                    <label>BP Username</label>
                    <InputText
                        value={user.bpUsername}
                        onChange={(e) => handleChange('bpUsername', e.target.value)}
                        className="w-full mb-3"
                    />
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-12 md:col-6">
                    <label>BP Password</label>
                    <InputText
                        value={user.bpPassword}
                        onChange={(e) => handleChange('bpPassword', e.target.value)}
                        className="w-full mb-3"
                    />

                    <label>Phone Number</label>
                    <InputText
                        value={user.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        className="w-full mb-3"
                    />
                    <div className='flex  justify-between items-center'>

                        <div className="flex align-items-center gap-4  mt-4">
                            <Checkbox
                                inputId="isAccepted"
                                checked={user.isAccepted}
                                onChange={(e) => handleChange('isAccepted', e.checked)}
                            />
                            <label htmlFor="isAccepted">Accepted</label>
                        </div>

                        <div className="flex align-items-center gap-4">
                            <Checkbox
                                inputId="isAdmin"
                                checked={user.isAdmin}
                                onChange={(e) => handleChange('isAdmin', e.checked)}
                            />
                            <label htmlFor="isAdmin">Admin</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="mt-4 flex gap-2">
                <Button label="Update" icon="pi pi-check" onClick={saveHandle} />
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    className="p-button-secondary"
                    onClick={() => router.push('/pages/users')}
                />
            </div>
        </div>
    );
}
