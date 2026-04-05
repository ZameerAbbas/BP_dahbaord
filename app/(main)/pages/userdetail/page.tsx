'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByName, UserType, deleteUser } from '@/firebaseUtils';
import { LayoutContext } from '@/layout/context/layoutcontext';

const UserSearchPage = () => {
    const [searchName, setSearchName] = useState('');

    const { layoutConfig } = useContext(LayoutContext);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        if (!searchName.trim()) return;
        setLoading(true);
        try {
            const foundUser = await getUserByName(searchName.trim());
            setSelectedUser(foundUser);
        } catch (err) {
            console.error(err);
            setSelectedUser(null);
        } finally {
            setLoading(false);
        }
    };

    const editUser = (userData: UserType) => {
        localStorage.setItem('userData', JSON.stringify(userData));
        router.push('/pages/useredit');
    };

    const deleteUserHandler = async (uid: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await deleteUser(uid);
            setSelectedUser(null);
        }
    };

    const isAcceptedBodyTemplate = (rowData: UserType) => <span>{rowData.isAccepted ? 'Active' : 'Pending'}</span>;

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

                    {/* Name input and Generate button */}
                    <div className="flex gap-3 mb-4 flex-wrap">
                        <InputText value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Enter user name" className="w-full md:w-1/3" />
                        <Button label="Generate" icon="pi pi-search" onClick={handleGenerate} className="p-button-success" />
                    </div>

                    {/* User Table */}
                    {loading ? (
                        <div>Loading user...</div>
                    ) : (
                        <DataTable
                            value={selectedUser ? [selectedUser] : []} // always array
                            dataKey="uid"
                            className={`p-datatable-gridlines ${layoutConfig.colorScheme === 'dark' ? 'custom-dark-table' : 'custom-light-table'}`}
                            showGridlines
                            responsiveLayout="scroll"
                            emptyMessage="No users found."
                            scrollable
                            scrollHeight="50vh"
                        >
                            <Column
                                field="displayName"
                                header="Name"
                                style={{
                                    backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                                    color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000',
                                    minWidth: '8rem'
                                }}
                                className="border-b border-gray-500"
                            />
                            <Column
                                field="email"
                                header="Email"
                                style={{
                                    backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                                    color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000',
                                    minWidth: '10rem'
                                }}
                                className="border-b border-gray-500"
                            />
                            <Column
                                field="phoneNumber"
                                header="Phone"
                                style={{
                                    backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                                    color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000',
                                    minWidth: '8rem'
                                }}
                                className="border-b border-gray-500"
                            />
                            <Column
                                field="bpUsername"
                                header="BP Username"
                                style={{
                                    backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                                    color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000',
                                    minWidth: '8rem'
                                }}
                                className="border-b border-gray-500"
                            />
                            <Column
                                field="bpPassword"
                                header="BP Password"
                                style={{
                                    backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                                    color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000',
                                    minWidth: '8rem'
                                }}
                                className="border-b border-gray-500"
                            />
                            <Column
                                field="isAccepted"
                                header="Status"
                                body={isAcceptedBodyTemplate}
                                style={{
                                    backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                                    color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000',
                                    minWidth: '8rem'
                                }}
                                className="border-b border-gray-500"
                            />
                            <Column
                                header="Action"
                                style={{
                                    backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                                    color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000',
                                    minWidth: '12rem'
                                }}
                                className="border-b border-gray-500"
                                body={(rowData: UserType) => (
                                    <div className="flex gap-2">
                                        <Button icon="pi pi-pencil" className="p-button-warning p-button-sm" onClick={() => editUser(rowData)} />
                                        <Button icon="pi pi-trash" className="p-button-danger p-button-sm" onClick={() => deleteUserHandler(rowData.uid)} />
                                    </div>
                                )}
                            />
                        </DataTable>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSearchPage;
