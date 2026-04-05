'use client';

import React, { useContext, useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

import { listenBanks, updateBankStatus, deleteBank } from '@/firebaseUtils';
import { useRouter } from 'next/navigation';
import { LayoutContext } from '@/layout/context/layoutcontext';

export interface bankInfoType {
    uid: string;
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    category: string;
    status: boolean;
}

const Banks = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [banks, setBanks] = useState<bankInfoType[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    // ✅ Fetch Banks (Realtime)
    useEffect(() => {
        const unsubscribe = listenBanks((data: bankInfoType[]) => {
            setBanks(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // ✅ Toggle Active / Inactive
    const handleToggleStatus = async (bank: bankInfoType) => {
        try {
            await updateBankStatus(bank.uid, !bank.status);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ Delete
    const handleDelete = async (bank: bankInfoType) => {
        try {
            await deleteBank(bank.uid);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ Status UI
    const statusTemplate = (row: bankInfoType) => {
        const handleToggleStatus = async () => {
            try {
                await updateBankStatus(row.uid, !row.status);
            } catch (err) {
                console.error(err);
            }
        };

        return <Tag value={row.status ? 'Active' : 'Inactive'} severity={row.status ? 'success' : 'danger'} className="cursor-pointer" onClick={handleToggleStatus} />;
    };

    const actionTemplate = (row: bankInfoType) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-sm bg-[#0F1D41] text-white hover:bg-[#0F1D49]" onClick={() => handleEdit(row)} />

                <Button icon="pi pi-trash" className="p-button-sm p-button-danger" onClick={() => handleDelete(row)} />
            </div>
        );
    };

    const handleEdit = (bank: bankInfoType) => {
        localStorage.setItem('bankId', JSON.stringify(bank.uid));
        router.push(`/pages/cerateupdatebank`);
    };

    return (
        <div className="card">
            {/* HEADER */}
            <div className=" mb-4">
                <div>
                    <h2 className="text-xl font-bold">Bank Management</h2>
                </div>

                <div>
                    <Button
                        label="Add Bank"
                        icon="pi pi-plus"
                        className="p-button-success w-full md:w-auto"
                        // disabled={banks.length === 3} // Disable if there are already 3 banks
                        onClick={() => {
                            localStorage.removeItem('bankId');
                            // if (banks.length === 3) {
                            //     alert('Maximum of 3 banks allowed. Please delete an existing bank to add a new one.');
                            // } else
                            router.push(`/pages/cerateupdatebank`);
                        }}
                        title={banks.length >= 3 ? 'Maximum of 3 banks allowed' : 'Add a new bank'}
                    />
                </div>
            </div>

            {/* TABLE */}
            <DataTable value={banks} loading={loading} showGridlines scrollable scrollHeight="60vh" className={`p-datatable-gridlines ${layoutConfig.colorScheme === 'dark' ? 'custom-dark-table' : 'custom-light-table'}`}>
                <Column
                    field="bankName"
                    header="Bank Name"
                    className="border-b-2 border-gray-500"
                    style={{
                        backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                        color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000'
                    }}
                />
                <Column
                    field="accountTitle"
                    header="Account Title"
                    className="border-b-2 border-gray-500"
                    style={{
                        backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                        color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000'
                    }}
                />
                <Column
                    field="accountNumber"
                    header="Account Number"
                    className="border-b-2 border-gray-500"
                    style={{
                        backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                        color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000'
                    }}
                />
                <Column
                    field="category"
                    header="Category"
                    style={{
                        backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                        color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000'
                    }}
                    body={(row: bankInfoType) => <p className="bg-green-500 rounded-full text-white px-2 py-1 inline-block">{row.category}</p>}
                    className="border-b-2 border-gray-500 "
                />
                <Column header="Status" body={statusTemplate} className="border-b-2 border-gray-500" 
                   style={{
                                backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                                color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000',
                            
                            }}
                />
                <Column
                    header="Actions"
                    body={actionTemplate}
                    className="border-b-2 border-gray-500"
                    style={{
                        backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
                        color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#000000'
                    }}
                />
            </DataTable>
        </div>
    );
};

export default Banks;
