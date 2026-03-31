'use client';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column, ColumnFilterApplyTemplateOptions, ColumnFilterClearTemplateOptions } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState } from 'react';
import { listenWithdrawalOrders, OrderType, updateOrderStatus } from '@/firebaseUtils';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/navigation';

interface UserType {
    uid: string;
    email: string;
    displayName: string;
    isAccepted: boolean;
    createdAt: string;
    isAdmin: boolean;
    bpUsername: string;
    phoneNumber: string;
}



const Withdrawals = () => {
    const [withdrawals, setWithdrawals] = useState<OrderType[]>([]);
    const [users, setUsers] = useState<Map<string, UserType>>(new Map());
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    const router = useRouter();

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        (_filters['global'] as any).value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between align-items-center gap-2 mb-3">
                <div className="flex gap-2 align-items-center">
                    <label className="font-semibold">Status:</label>
                    <Dropdown
                        value={selectedStatus}
                        options={[
                            { label: 'All', value: '' },
                            { label: 'Pending', value: 'pending' },
                            { label: 'Approved', value: 'approved' },
                            { label: 'Rejected', value: 'rejected' }
                        ]}
                        onChange={(e) => setSelectedStatus(e.value)}
                        placeholder="Select Status"
                        className="w-full md:w-14rem"
                    />
                </div>
                <div className="flex gap-2 align-items-center">
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} />
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search..." />
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
            phoneNumber: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
            },
            amount: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            },
            status: {
                operator: FilterOperator.OR,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            }
        });
        setGlobalFilterValue('');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR'
        }).format(value);
    };

    const imageBodyTemplate = (rowData: OrderType) => {
        return (


            <a onClick={() => handleDownload(rowData.screenshot)}
                className='  cursor-pointer'
            > View Image</a>
        );
    };

    const handleDownload = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'screenshot.jpg';
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const actionBodyTemplate = (rowData: OrderType) => {
        const isApprovalPending = rowData.status === 'pending';
        return (
            <div className="flex gap-2">
                <Button
                    label="Approve"
                    icon="pi pi-check"
                    className="p-button-rounded p-button-success p-button-sm"
                    onClick={() => handleApprove(rowData)}
                    disabled={!isApprovalPending}
                />
                <Button
                    label="Reject"
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-sm"
                    onClick={() => handleReject(rowData)}
                    disabled={!isApprovalPending}
                />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: OrderType) => {
        const statusClasses: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClasses[rowData.status] || 'bg-gray-100'}`}>
                {rowData.status?.charAt(0).toUpperCase() + rowData.status?.slice(1) || 'Unknown'}
            </span>
        );
    };

    const amountBodyTemplate = (rowData: OrderType) => {
        return formatCurrency(rowData.amount);
    };


    useEffect(() => {
        setLoading(true);
        const unsubscribeWithdrawals = listenWithdrawalOrders((withdrawalsList) => {
            setWithdrawals(withdrawalsList);
            setLoading(false);
        });
        return () => {
            unsubscribeWithdrawals();
        };
    }, []);


    const handleApprove = async (order: OrderType) => {
        try {
            localStorage.setItem(
                'orderInfo',
                JSON.stringify({
                    uid: order.uid,
                    orderId: order.id
                })
            );

            router.push('/pages/updatewithdrawals');
        } catch (error) {
            console.error('Error approving order:', error);
        }
    };

    const handleReject = async (order: OrderType) => {
        try {
            await updateOrderStatus(order.uid, order.id, 'rejected');

        } catch (error) {
            console.error('Error rejecting order:', error);
        }
    };

    const header = renderHeader();

    if (loading) return <div className="p-4 text-center">Loading withdrawals...</div>;



    const filteredWithdrawals = (selectedStatus
        ? withdrawals.filter(d => d.status === selectedStatus)
        : withdrawals
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5 className="mb-4 text-2xl font-bold">PENDING WITHDRAWALS</h5>
                    {header}
                    <DataTable
                        value={filteredWithdrawals}
                        // paginator
                        className="p-datatable-gridlines"
                        showGridlines
                        // rows={10}
                        dataKey="id"
                        filters={filters}
                        filterDisplay="menu"
                        loading={loading}
                        responsiveLayout="scroll"
                        emptyMessage="No withdrawals found."
                        scrollable
                        scrollHeight="60vh"
                    // pag
                    >
                        <Column field="createdAt" header="Date & Time" body={(rowData) => formatDate(rowData.createdAt)} style={{ minWidth: '14rem' }}
                        className='border-b-2 border-gray-500'
                        />
                        <Column field="userName" header="Customer Name" filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} className='border-b-2 border-gray-500'/>
                        <Column field="accountNumber" header="Phone" style={{ minWidth: '12rem' }} className='border-b-2 border-gray-500'/>
                        <Column field="amount" header="Amount" body={amountBodyTemplate} style={{ minWidth: '10rem' }} className='border-b-2 border-gray-500'/>
                        <Column field="bpId" header="BP Username" style={{ minWidth: '12rem' }} className='border-b-2 border-gray-500'/>
                        <Column field="screenshot" header="Attachment" body={imageBodyTemplate} style={{ minWidth: '10rem' }}  className='border-b-2 border-gray-500'/>
                        <Column field="status" header="Status" body={statusBodyTemplate} style={{ minWidth: '10rem' }} className='border-b-2 border-gray-500'  />
                        <Column header="Action" body={actionBodyTemplate} style={{ minWidth: '16rem' }} className='border-b-2 border-gray-500' />
                    </DataTable>

                    <Dialog
                        header="Withdrawal Screenshot"
                        visible={isDialogVisible}
                        style={{ width: '50vw' }}
                        modal
                        onHide={() => setIsDialogVisible(false)}
                    >
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Withdrawal Screenshot"
                                className="w-full h-auto object-contain rounded-md"
                            />
                        )}
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Withdrawals;
