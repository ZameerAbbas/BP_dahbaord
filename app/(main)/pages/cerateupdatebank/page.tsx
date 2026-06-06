'use client';

import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

import {
    createBank,
    updateBank,
    getBankById,
    bankInfoType
} from '@/firebaseUtils';

import { useRouter } from 'next/navigation';

const categoryOptions = [
    { label: 'EasyPaisa', value: 'EasyPaisa' },
    { label: 'JazzCash', value: 'JazzCash' },
    { label: 'Bank', value: 'Bank' },
    { label: 'SadaPay', value: 'SadaPay' },
    { label: 'NayaPay', value: 'NayaPay' },
];

const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
];

const CreateUpdateBank = () => {

    const router = useRouter();
    const [form, setForm] = useState<bankInfoType>({
        uid: '',
        bankName: '',
        accountTitle: '',
        accountNumber: '',
        category: '',
        status: true,
        limit: 0
    });

    const [loading, setLoading] = useState(false);
    const id = localStorage.getItem('bankId') ? JSON.parse(localStorage.getItem('bankId') as string) : null;
    const isEdit = !!id;

    useEffect(() => {
        if (!id) return;

        const fetchBank = async () => {
            const data = await getBankById(id);
            if (data) setForm(data);
        };

        fetchBank();
    }, [id]);

    const handleChange = (field: keyof bankInfoType, value: any) => {
        setForm({ ...form, [field]: value });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            if (isEdit) {
                await updateBank(form.uid, form);
            } else {
                await createBank(form);
            }

            alert('Bank saved successfully');

            localStorage.removeItem('bankId');
            router.push('/pages/bankinfo');

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card max-w-3xl mx-auto">
            <h2 className="text-center text-xl font-bold mb-4">Bank Info</h2>

            <div className="grid">

                {/* Bank Name */}
                <div className="col-12">
                    <label>Bank Name</label>
                    <InputText
                        value={form.bankName}
                        onChange={(e) => handleChange('bankName', e.target.value)}
                        placeholder="Enter bank name"
                        className="w-full"
                    />
                </div>

                {/* Account Title */}
                <div className="col-12">
                    <label>Account Title</label>
                    <InputText
                        value={form.accountTitle}
                        onChange={(e) => handleChange('accountTitle', e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Account Number */}
                <div className="col-12">
                    <label>Account Number</label>
                    <InputText
                        value={form.accountNumber}
                        onChange={(e) => handleChange('accountNumber', e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Category */}
                <div className="col-12">
                    <label>Category</label>
                    <Dropdown
                        value={form.category}
                        options={categoryOptions}
                        onChange={(e) => handleChange('category', e.value)}
                        placeholder="Select Category"
                        className="w-full"
                    />
                </div>

                {/* Status */}
                <div className="col-12">
                    <label>Status</label>
                    <Dropdown
                        value={form.status}
                        options={statusOptions}
                        onChange={(e) => handleChange('status', e.value)}
                        className="w-full"
                    />
                </div>

                {/* Limit */}
                <div className="col-12">
                    <label>Limit</label>
                    <InputText
                        type="number"
                        value={form.limit.toString()}
                        onChange={(e) => handleChange('limit', Number(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="flex justify-center mt-4">
                <Button
                    label={isEdit ? 'Update Info' : 'Create Bank'}
                    loading={loading}
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
};

export default CreateUpdateBank;