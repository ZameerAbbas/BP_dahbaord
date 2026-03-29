'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

import {
    listenBanks,
    updateBankStatus,
    deleteBank
} from '@/firebaseUtils';
import { useRouter } from 'next/navigation';

export interface bankInfoType {
    uid: string;
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    category: string;
    status: boolean;
}

const Banks = () => {
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

        return (
            <Tag
                value={row.status ? 'Active' : 'Inactive'}
                severity={row.status ? 'success' : 'danger'}
                className="cursor-pointer"
                onClick={handleToggleStatus}
            />
        );
    };

    // ✅ Action Buttons
    const actionTemplate = (row: bankInfoType) => {
        return (
            <div className="flex gap-2">
                <Button
                    label={'Edit'}
                    icon="pi pi-pencil"
                    className="p-button-sm p-button-warning"
                    onClick={() => handleEdit(row)}
                />

                <Button
                    label="Delete"
                    icon="pi pi-trash"
                    className="p-button-sm p-button-danger"
                    onClick={() => handleDelete(row)}
                />
            </div>
        );
    };

    const handleEdit = (bank: bankInfoType) => {
        localStorage.setItem('bankId', JSON.stringify(bank.uid));
        router.push(`/pages/cerateupdatebank`);
    }

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
                        onClick={() => {
                            router.push(`/pages/cerateupdatebank`);
                        }}
                    />
                </div>
            </div>

            {/* TABLE */}
            <DataTable value={banks} loading={loading} showGridlines
                scrollable
                scrollHeight="60vh"
            >
                <Column field="bankName" header="Bank Name" />
                <Column field="accountTitle" header="Account Title" />
                <Column field="accountNumber" header="Account Number" />
                <Column field="category" header="Category" />
                <Column header="Status" body={statusTemplate} />
                <Column header="Actions" body={actionTemplate} />
            </DataTable>
        </div>
    );
};

export default Banks;
