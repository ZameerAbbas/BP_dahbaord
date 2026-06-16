'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import React, { useContext, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByName, UserType, deleteUser } from '@/firebaseUtils';
import { LayoutContext } from '@/layout/context/layoutcontext';

const UserSearchPage = () => {
    const [searchName, setSearchName] = useState('');
    const { layoutConfig } = useContext(LayoutContext);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // ✅ Cache — don't re-fetch same name twice
    const cache = useRef<Record<string, UserType | null>>({});

    const handleGenerate = useCallback(async () => {
        const trimmed = searchName.trim().toLowerCase();
        if (!trimmed) return;

        setError('');

        // ✅ Return cached result instantly
        if (cache.current[trimmed] !== undefined) {
            setSelectedUser(cache.current[trimmed]);
            return;
        }

        setLoading(true);
        try {
            const foundUser = await getUserByName(trimmed);
            cache.current[trimmed] = foundUser ?? null; // ✅ cache result
            setSelectedUser(foundUser);
            if (!foundUser) setError('No user found with that name.');
        } catch (err) {
            console.error(err);
            setSelectedUser(null);
            setError('Error fetching user. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [searchName]);

    // ✅ Press Enter to search
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleGenerate();
    };

    const editUser = (userData: UserType) => {
        localStorage.setItem('userData', JSON.stringify(userData));
        router.push('/pages/useredit');
    };

    const deleteUserHandler = async (uid: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(uid);
                // ✅ Clear cache for deleted user
                const trimmed = searchName.trim().toLowerCase();
                delete cache.current[trimmed];
                setSelectedUser(null);
                setSearchName('');
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    const colStyle = {
        backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
        color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000',
    };

    const isAcceptedBodyTemplate = (rowData: UserType) => (
        <span className={rowData.isAccepted ? 'text-green-500 font-bold' : 'text-yellow-500 font-bold'}>
            {rowData.isAccepted ? 'Active' : 'Pending'}
        </span>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card p-4 shadow-md border-round">
                    <div className="mb-4">
                        <h4 className="text-red-600 mb-2">USER DETAILS</h4>
                        <p className="text-gray-600 text-sm">
                            <i className="pi pi-home mr-2"></i>
                            Manager / User Details
                        </p>
                    </div>

                    {/* Search input */}
                    <div className="flex gap-3 mb-2 flex-wrap">
                        <InputText
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onKeyDown={handleKeyDown} // ✅ Enter key
                            placeholder="Enter user name and press Enter"
                            className="w-full md:w-1/3"
                        />
                        <Button
                            label="Search"
                            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-search'}
                            onClick={handleGenerate}
                            className="p-button-success"
                            disabled={loading || !searchName.trim()}
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <p className="text-red-500 text-sm mb-3">{error}</p>
                    )}

                    {/* User Table */}
                    <DataTable
                        value={selectedUser ? [selectedUser] : []}
                        dataKey="uid"
                        className={`p-datatable-gridlines ${layoutConfig.colorScheme === 'dark' ? 'custom-dark-table' : 'custom-light-table'}`}
                        showGridlines
                        responsiveLayout="scroll"
                        emptyMessage={loading ? 'Searching...' : 'No users found.'}
                        scrollable
                        scrollHeight="50vh"
                    >
                        <Column field="displayName" header="Name" style={{ ...colStyle, minWidth: '8rem' }} className="border-b border-gray-500" />
                        <Column field="email" header="Email" style={{ ...colStyle, minWidth: '10rem' }} className="border-b border-gray-500" />
                        <Column field="phoneNumber" header="Phone" style={{ ...colStyle, minWidth: '8rem' }} className="border-b border-gray-500" />
                        <Column field="bpUsername" header="BP Username" style={{ ...colStyle, minWidth: '8rem' }} className="border-b border-gray-500" />
                        <Column field="bpPassword" header="BP Password" style={{ ...colStyle, minWidth: '8rem' }} className="border-b border-gray-500" />
                        <Column field="isAccepted" header="Status" body={isAcceptedBodyTemplate} style={{ ...colStyle, minWidth: '8rem' }} className="border-b border-gray-500" />
                        <Column
                            header="Action"
                            style={{ ...colStyle, minWidth: '12rem' }}
                            className="border-b border-gray-500"
                            body={(rowData: UserType) => (
                                <div className="flex gap-2">
                                    <Button icon="pi pi-pencil" className="p-button-warning p-button-sm" onClick={() => editUser(rowData)} />
                                    <Button icon="pi pi-trash" className="p-button-danger p-button-sm" onClick={() => deleteUserHandler(rowData.uid)} />
                                </div>
                            )}
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default UserSearchPage;