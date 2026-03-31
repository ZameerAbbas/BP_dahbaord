'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState } from 'react';
import { getAllPendingUsers, updateUserStatus, UserType } from '@/firebaseUtils';;


import { useRouter } from 'next/navigation';
const Users = () => {
    const [users, setUsers] = useState<UserType[]>([]);

    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');


    const router = useRouter();

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        (_filters['global'] as any).value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex flex-row justify-between items-center gap-3">
                <div className="flex align-items-center gap-3 flex-wrap">
                    <div className="flex align-items-center gap-2">
                        <label className="font-semibold">Bulk Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-2 border-1 surface-border border-round"
                            style={{ minWidth: '150px', padding: '0.5rem 0.75rem' }}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Active">Active</option>
                        </select>
                        <Button
                            label="Go"
                            icon="pi pi-arrow-right"
                            className="p-button-sm"
                            onClick={() => {
                                handleBulkToggle(statusFilter as 'Active' | 'Pending');
                            }}
                        />
                    </div>
                </div>

                <div className="flex align-items-center gap-3">
                    <label className="font-semibold">Name Search:</label>
                    <span className="p-input-icon-left" style={{ flex: 1, maxWidth: '350px' }}>
                        <i className="pi pi-search" />
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Search by name..."
                            className="w-full"
                        />
                    </span>
                </div>
            </div>
        );
    };

    const isAcceptedBodyTemplate = (rowData: UserType) => {
        return (
            <span >
                {rowData.isAccepted ? 'Active' : 'Pending'}
            </span>
        );
    };



    useEffect(() => {
        setLoading(true);
        const unsubscribeWithdrawals = getAllPendingUsers((userList) => {
            setUsers(userList);
            setLoading(false);
        });
        return () => {
            unsubscribeWithdrawals();
        };
    }, []);


    const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);

    const handleBulkToggle = async (status: 'Active' | 'Pending') => {
        const newValue = status === 'Active';
        const uids = selectedUsers.map(u => u.uid);
        for (let uid of uids) {
            await updateUserStatus(uid, newValue);
        }
        setUsers((prev) =>
            prev.map((u) => (uids.includes(u.uid) ? { ...u, isAccepted: newValue } : u))
        );
        setSelectedUsers([]);
    };



    if (loading) return <div className="p-4">Loading users...</div>;




    const editLatePayments = (userData: UserType) => {
        localStorage.setItem('userData', JSON.stringify(userData));
        router.push(`/pages/useredit`);
    };





    const displayUsers = users
        .filter(user =>
            globalFilterValue === '' ||
            user.displayName?.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
            user.email?.toLowerCase().includes(globalFilterValue.toLowerCase())
        )
        .sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

    console.log('Display Users:', displayUsers);
    console.log('Display Users:', displayUsers);

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">


                    {/* Page Title */}
                    <div className="mb-4">
                        <h4 style={{ color: '#e74c3c', margin: '0 0 1rem 0' }}>USER DETAILS</h4>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                            <i className="pi pi-home" style={{ marginRight: '0.5rem' }}></i>
                            Manager / User Details
                        </p>
                    </div>

                    {/* Filter Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: '1rem' }}>USER LIST</p>
                        {renderHeader()}
                    </div>

                    <DataTable<any>
                        value={displayUsers}
                        className="p-datatable-gridlines"
                        showGridlines
                        dataKey="uid"
                        filters={filters}
                        filterDisplay="menu"
                        loading={loading}
                        responsiveLayout="scroll"
                        emptyMessage="No users found."
                        scrollable
                        scrollHeight="60vh"


                        selection={selectedUsers}
                        onSelectionChange={(e: { value: UserType[] }) => setSelectedUsers(e.value)}
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}
                        className=''
                        />
                        <Column field="displayName" header="Name" filterPlaceholder="Search by name"
                            body={(rowData) => (
                                <span
                                    style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
                                    onClick={() => editLatePayments(rowData)}
                                >
                                    {rowData.displayName}
                                </span>
                            )}
                            style={{ minWidth: '8rem' }}
                            className='bg-yellow-500 border-b border-white  '
                            />
                        <Column field="phoneNumber" header="Phone " filterPlaceholder="Search by phoneNumber" style={{ minWidth: '8rem' }} className='bg-yellow-500' />
                        <Column field="bpUsername" header="BP Username" filterPlaceholder="Search by bpUsername" style={{ minWidth: '8rem' }} className='bg-yellow-500' />
                        <Column field="bpPassword" header="BP Password" filterPlaceholder="Search by bpPassword" style={{ minWidth: '8rem' }} className='bg-yellow-500' />
                        <Column field="isAccepted" header="Status" body={isAcceptedBodyTemplate} style={{ minWidth: '8rem' }} className='bg-yellow-500
                        ' />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default Users;
