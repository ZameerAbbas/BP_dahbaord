





'use client';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column, ColumnFilterClearTemplateOptions, ColumnFilterApplyTemplateOptions } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { ToggleButton } from 'primereact/togglebutton';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState, useRef } from 'react';
import { getAllUsers, updateUserStatus, updateUser, deleteUser, UserType } from '@/firebaseUtils';;
import { Checkbox } from 'primereact/checkbox';


import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";

import { useRouter } from 'next/navigation';




import { db } from '@/firebase';
import { ref, get, update } from 'firebase/database';
const Users = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [userUpdate, setUserUpate] = useState<UserType>({
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
                        <Button label="Go" icon="pi pi-arrow-right" className="p-button-sm" onClick={() => console.log('Filter applied')} />
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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

    const acceptToggleTemplate = (rowData: UserType) => {
        return (
            <ToggleButton
                checked={rowData.isAccepted}
                onChange={(e) => handleToggleIsAccepted(rowData.uid, e.value)}
                onIcon="pi pi-check"
                offIcon="pi pi-times"
            />
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

    console.log("userList", users)


    const actionBodyTemplate = (rowData: UserType) => {
        return (
            <div className="flex gap-1">
                <Button rounded outlined className="mr-2 border-none" onClick={() => editLatePayments(rowData)} > Edit</Button>
                <Button rounded outlined className="mr-2 border-none" onClick={() => confirmDeleteLatePayments(rowData)} > Delete</Button>
            </div>
        );
    };

    const editLatePayments = (userData: UserType) => {
        localStorage.setItem('userData', JSON.stringify(userData));
        router.push(`/pages/useredit`);
    };

    const handleChange = (field: keyof UserType, value: any) => {
        if (userUpdate) {
            setUserUpate({ ...userUpdate, [field]: value });
        }
    };


    const hideDeleteDuessDialog = () => {
        setDeleteDialog(false);
        setUserUpate({
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
        })
    };


    const confirmDeleteLatePayments = (userData: UserType) => {
        setDeleteDialog(true);
        setUserUpate(userData)
    };

    console.log("Update User", userUpdate)



    const handleDelete = async () => {
        try {
            await deleteUser(userUpdate.uid);

            setUsers((prev) => prev.filter((u) => u.uid !== userUpdate.uid));

            // Option 2 (optional): reload from DB
            // await loadUsers();

        } catch (error) {
            console.error(error);
        }
    };


    const saveHandle = async () => {
        if (userUpdate) {
            const { uid, ...updates } = userUpdate;

            await updateUser(uid, updates);

            setUsers((prev) =>
                prev.map((u) =>
                    u.uid === uid ? { ...u, ...updates } : u
                )
            );

            setUpdateDialog(false);
            // toast && toast.current.show({ severity: "success", summary: "Loaded", detail: "LatePayments Updated", life: 3000 });
        } else {
            // toast && toast.current.show({ severity: "error", summary: "Error", detail: d["errors"], life: 3000 });
        }
    };


    const hideDialog = () => {

        setUpdateDialog(false);
        setUserUpate({
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
        })
    };

    const duesDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-edit" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveHandle} />
        </>
    );

    const deleteDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-cancel" className="p-button-text" onClick={hideDeleteDuessDialog} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-text" onClick={handleDelete} />
        </>
    );




    const filteredUsers = statusFilter === 'All'
        ? users
        : statusFilter === 'Active'
            ? users.filter(u => u.isAccepted)
            : users.filter(u => !u.isAccepted);

    const displayUsers = filteredUsers.filter(user =>
        globalFilterValue === '' ||
        user.displayName?.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
        user.email?.toLowerCase().includes(globalFilterValue.toLowerCase())
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />

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
                        paginator
                        className="p-datatable-gridlines"
                        showGridlines
                        rows={10}
                        dataKey="uid"
                        filters={filters}
                        filterDisplay="menu"
                        loading={loading}
                        responsiveLayout="scroll"
                        emptyMessage="No users found."
                    >
                        <Column field="displayName" header="Name" filterPlaceholder="Search by name" style={{ minWidth: '8rem' }} />
                        <Column field="email" header="Email" filterPlaceholder="Search by email" style={{ minWidth: '8rem' }} />
                        <Column field="phoneNumber" header="Phone Number" filterPlaceholder="Search by phoneNumber" style={{ minWidth: '8rem' }} />
                        <Column field="bpUsername" header="BP Username" filterPlaceholder="Search by bpUsername" style={{ minWidth: '8rem' }} />
                        <Column field="bpPassword" header="BP Password" filterPlaceholder="Search by bpPassword" style={{ minWidth: '8rem' }} />
                        <Column field="createdAt" header="Created Date" body={(rowData) => formatDate(rowData.createdAt)} style={{ minWidth: '8rem' }} />
                        <Column field="updatedAt" header="Update Date" body={(rowData) => formatDate(rowData.updatedAt)} style={{ minWidth: '8rem' }} />
                        <Column field="isAdmin" header="Admin" body={(rowData) => rowData.isAdmin ? <i className="pi pi-check text-green-500"></i> : <i className="pi pi-times text-red-500"></i>} style={{ minWidth: '8rem' }} />
                        <Column field="isAccepted" header="Active" body={isAcceptedBodyTemplate} style={{ minWidth: '8rem' }} />
                        <Column header="Toggle Accept" body={acceptToggleTemplate} style={{ minWidth: '8rem' }} />
                        <Column header="Action" body={actionBodyTemplate} headerStyle={{ minWidth: "8rem" }}></Column>
                    </DataTable>
                </div>
            </div>


            <Dialog visible={updateDialog} style={{ width: "450px" }} header="Update User Detais" modal className="p-fluid" footer={duesDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="displayName">Name</label>
                    <InputText
                        id="displayName"
                        value={userUpdate.displayName}
                        onChange={(e) => handleChange('displayName', e.target.value)}
                        className="w-full mb-3"
                    />

                    <label htmlFor="email">Email</label>
                    <InputText
                        id="email"
                        value={userUpdate.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full mb-3"
                    />
                    <label htmlFor="bpUsername">BP User Name</label>
                    <InputText
                        id="bpUsername"
                        value={userUpdate.bpUsername}
                        onChange={(e) => handleChange('bpUsername', e.target.value)}
                        className="w-full mb-3"
                    />
                    <label htmlFor="bpPassword">BP Password</label>
                    <InputText
                        id="bpPassword"
                        value={userUpdate.bpPassword}
                        onChange={(e) => handleChange('bpPassword', e.target.value)}
                        className="w-full mb-3"
                    />

                    <div className="flex align-items-center gap-4 mb-3">
                        <Checkbox
                            inputId="isAccepted"
                            checked={userUpdate.isAccepted}
                            onChange={(e) => handleChange('isAccepted', e.checked)}
                        />
                        <label htmlFor="isAccepted">Accepted</label>
                    </div>

                    <div className="flex align-items-center gap-4">
                        <Checkbox
                            inputId="isAdmin"
                            checked={userUpdate.isAdmin}
                            onChange={(e) => handleChange('isAdmin', e.checked)}
                        />
                        <label htmlFor="isAdmin">Admin</label>
                    </div>
                </div>


            </Dialog>

            <Dialog visible={deleteDialog} style={{ width: "450px" }} header="Confirm" modal footer={deleteDialogFooter} onHide={hideDeleteDuessDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
                    {userUpdate && <span>Are you sure you want to delete the  {userUpdate.displayName}?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default Users;
