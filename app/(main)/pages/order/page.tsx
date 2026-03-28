'use client';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column, ColumnFilterApplyTemplateOptions, ColumnFilterClearTemplateOptions } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { ToggleButton } from 'primereact/togglebutton';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState } from 'react';
import { getAllUsers, getAllOrders, updateOrderStatus } from '@/firebaseUtils';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';

interface UserType {
    uid: string;
    email: string;
    displayName: string;
    isAccepted: boolean;
    createdAt: string;
    isAdmin: boolean;
}

interface OrderType {
    id: string;
    uid: string;
    accountNumber: string;
    amount: number;
    isDeposit: boolean;
    createdAt: string;
    notes: string;
    orderNumber: string;
    paymentMethod: string;
    status: string;
    type: string;
    screenshot: string;
    updatedAt: string;
    displayName?: string;
    email?: string;
}

const Orders = () => {
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [users, setUsers] = useState<Map<string, UserType>>(new Map());
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');

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
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </span>
            </div>
        );
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            orderNumber: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
            },
            displayName: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
            },
            email: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
            },
            status: {
                operator: FilterOperator.OR,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            },
            isDeposit: { value: null, matchMode: FilterMatchMode.EQUALS }
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR'
        }).format(value);
    };

    const depositBodyTemplate = (rowData: OrderType) => {
        return (
            <i
                className={classNames('pi', {
                    'text-green-500 pi-check-circle': rowData.isDeposit,
                    'text-red-500 pi-times-circle': !rowData.isDeposit
                })}
            ></i>
        );



    };

    const fetchData = async () => {
        setLoading(true);

        try {
            const ordersObj = await getAllOrders();

            const orderList = Object.entries(ordersObj).flatMap(
                ([uid, orderData]: [string, any]) =>
                    Object.entries(orderData).map(([orderId, order]: [string, any]) => ({
                        id: orderId,
                        uid,
                        ...order,
                    }))
            );

            setOrders(orderList);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        initFilters();
    }, []);


    const statusBodyTemplate = (rowData: OrderType) => {
        const statusOptions = [
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Completed', value: 'completed' },
        ];

        const statusClasses: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800',
        };

        const handleChange = async (e: { value: string }) => {
            const newStatus = e.value;
            await updateOrderStatus(rowData.uid, rowData.id, newStatus);

            // Update local state or refetch
            fetchData();
        };

        return (
            <Dropdown
                value={rowData.status}
                options={statusOptions}
                onChange={handleChange}
                placeholder="Select Status"
                className={`${statusClasses[rowData.status]} rounded-full text-sm w-[100px]`}
            />
        );
    };

    const amountBodyTemplate = (rowData: OrderType) => {
        return formatCurrency(rowData.amount);
    };

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const imageBodyTemplate = (rowData: OrderType) => {
        return (
            <img
                src={rowData.screenshot}
                alt="Screenshot"
                className="w-10 h-8 object-cover rounded-md cursor-pointer"
                onClick={() => {
                    setSelectedImage(rowData.screenshot);
                    setIsDialogVisible(true);
                }}
            />
        );
    };

    const header = renderHeader();





    console.log("orders", orders)
    if (loading) return <div className="p-4">Loading orders...</div>;

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>All Orders by User</h5>
                    <DataTable
                        value={orders}
                        paginator
                        className="p-datatable-gridlines"
                        showGridlines
                        rows={10}
                        dataKey="id"
                        filters={filters}
                        filterDisplay="menu"
                        loading={loading}
                        responsiveLayout="scroll"
                        emptyMessage="No orders found."
                        header={header}
                    >
                        <Column field="displayName" header="User Name" filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />
                        <Column field="email" header="Email" filterPlaceholder="Search by email" style={{ minWidth: '15rem' }} />
                        <Column field="orderNumber" header="Order Number" filterPlaceholder="Search by order" style={{ minWidth: '12rem' }} />
                        <Column field="accountNumber" header="Account Number" style={{ minWidth: '12rem' }} />
                        <Column field="amount" header="Amount" body={amountBodyTemplate} style={{ minWidth: '10rem' }} />
                        <Column
                            field="screenshot"
                            header="Image"
                            body={imageBodyTemplate}
                            style={{ minWidth: '10rem' }}
                        />
                        <Column field="paymentMethod" header="Payment Method" style={{ minWidth: '12rem' }} />
                        <Column field="status" header="Status" body={statusBodyTemplate} filterPlaceholder="Filter by status" style={{ minWidth: '10rem' }} />
                        <Column field="type" header="Type" style={{ minWidth: '8rem' }} />
                        <Column field="createdAt" header="Created Date" body={(rowData) => formatDate(rowData.createdAt)} style={{ minWidth: '10rem' }} />
                        <Column field="isDeposit" header="Is Deposit" body={depositBodyTemplate} style={{ minWidth: '8rem' }} />

                    </DataTable>

                    <Dialog
                        header="Screenshot"
                        visible={isDialogVisible}
                        style={{ width: '50vw' }}
                        modal
                        onHide={() => setIsDialogVisible(false)}
                    >
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Screenshot"
                                className="w-full h-auto object-contain rounded-md"
                            />
                        )}
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Orders;
