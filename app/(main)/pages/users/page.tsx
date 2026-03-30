'use client';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column, ColumnFilterClearTemplateOptions, ColumnFilterApplyTemplateOptions } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState, useRef } from 'react';
import { getAllUsers, updateUserStatus, UserType, } from '@/firebaseUtils';;
import { Toast } from "primereact/toast";
import { useRouter } from 'next/navigation';


const Users = () => {
    const [users, setUsers] = useState<UserType[]>([]);


    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const toast = useRef(null);

    const [updateDialog, setUpdateDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const clearFilter = () => {
        initFilters();
    };



    const router = useRouter();

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        (_filters['global'] as any).value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        const filteredUsers = statusFilter === 'All'
            ? users
            : statusFilter === 'Active'
                ? users.filter(u => u.isAccepted)
                : users.filter(u => !u.isAccepted);

        return (
            <div className="flex flex-row   justify-between items-center gap-3">
                <div className="flex align-items-center gap-3 flex-wrap">
                    <div className="flex align-items-center gap-2">
                        <label className="font-semibold">Bulk Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-2 border-1 surface-border border-round"
                            style={{ minWidth: '150px', padding: '0.5rem 0.75rem' }}
                        >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                        </select>
                        {/* <Button label="Go" icon="pi pi-arrow-right" className="p-button-sm" onClick={() => console.log('Filter applied')} /> */}
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

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            displayName: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
            },
            email: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
            },
            isAccepted: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue('');
    };



    const isAcceptedBodyTemplate = (rowData: UserType) => {
        return (
            <i
                className={classNames('pi', {
                    'text-green-500 pi-check-circle': rowData.isAccepted,
                    'text-pink-500 pi-times-circle': !rowData.isAccepted
                })}
            ></i>
        );
    };


    const loadUsers = async () => {
        const usersObj = await getAllUsers();
        const userList = Object.entries(usersObj).map(([uid, data]: [string, any]) => ({
            uid,
            ...data,
        }));
        setUsers(userList);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
        initFilters();
    }, []);

    const handleToggleIsAccepted = async (uid: string, newValue: boolean) => {
        await updateUserStatus(uid, newValue);
        setUsers((prev) =>
            prev.map((u) => (u.uid === uid ? { ...u, isAccepted: newValue } : u))
        );
    };




    if (loading) return <div className="p-4">Loading users...</div>;

    const actionBodyTemplate = (rowData: UserType) => {
        return (
            <div className="flex gap-1">
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editLatePayments(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteLatePayments(rowData)} />
            </div>
        );
    };

    const editLatePayments = (userData: UserType) => {
        localStorage.setItem('userData', JSON.stringify(userData));
        router.push(`/pages/useredit`);
    };


    const confirmDeleteLatePayments = (userData: UserType) => {
        setDeleteDialog(true);

    };


    const displayUsers = users
        .filter(user => {
            if (statusFilter === 'Active') return user.isAccepted;
            if (statusFilter === 'Pending') return !user.isAccepted;
            return true;
        })
        .filter(user => {
            return (
                globalFilterValue === '' ||
                user.displayName?.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
                user.email?.toLowerCase().includes(globalFilterValue.toLowerCase())
            );
        });
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

                    <DataTable
                        value={displayUsers}
                        // paginator
                        className="p-datatable-gridlines"
                        showGridlines
                        // rows={10}
                        dataKey="uid"
                        filters={filters}
                        filterDisplay="menu"
                        loading={loading}
                        responsiveLayout="scroll"
                        emptyMessage="No users found."
                        scrollable
                        scrollHeight="60vh"
                    >
                        <Column field="displayName" header="Name" filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />
                        <Column field="email" header="Email" filterPlaceholder="Search by email" style={{ minWidth: '15rem' }} />
                        <Column field="phoneNumber" header="Phone Number" filterPlaceholder="Search by phoneNumber" style={{ minWidth: '15rem' }} />
                        <Column field="bpUsername" header="BP Username" filterPlaceholder="Search by bpUsername" style={{ minWidth: '15rem' }} />
                        <Column field="bpPassword" header="BP Password" filterPlaceholder="Search by bpPassword" style={{ minWidth: '15rem' }} />
                        <Column field="isAccepted" header="Active" body={isAcceptedBodyTemplate} style={{ minWidth: '8rem' }} />
                        <Column header="Action" body={actionBodyTemplate} headerStyle={{ minWidth: "13rem" }}></Column>
                    </DataTable>
                </div>
            </div>





        </div>
    );
};

export default Users;
