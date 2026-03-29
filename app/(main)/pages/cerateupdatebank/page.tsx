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



const bankOptions = [

    { label: 'EasyPaisa', value: 'EasyPaisa' },
    { label: 'JazzCash', value: 'JazzCash' },
    { label: 'SadaPay', value: 'SadaPay' },
    { label: 'NayaPay', value: 'NayaPay' },

    { label: 'National Bank of Pakistan (NBP)', value: 'NBP' },
    { label: 'Habib Bank Limited (HBL)', value: 'HBL' },
    { label: 'United Bank Limited (UBL)', value: 'UBL' },
    { label: 'MCB Bank', value: 'MCB' },
    { label: 'Allied Bank Limited (ABL)', value: 'ABL' },
    { label: 'Bank Alfalah', value: 'Bank Alfalah' },
    { label: 'Faysal Bank', value: 'Faysal Bank' },
    { label: 'Askari Bank', value: 'Askari Bank' },

    { label: 'Meezan Bank', value: 'Meezan Bank' },
    { label: 'Bank Islami', value: 'Bank Islami' },
    { label: 'Dubai Islamic Bank Pakistan', value: 'Dubai Islamic' },
    { label: 'Al Baraka Bank Pakistan', value: 'Al Baraka' },

    { label: 'Standard Chartered Bank Pakistan', value: 'Standard Chartered' },
    { label: 'Habib Metropolitan Bank', value: 'Habib Metropolitan' },
    { label: 'Silk Bank', value: 'Silk Bank' },
    { label: 'Soneri Bank', value: 'Soneri Bank' },
    { label: 'JS Bank', value: 'JS Bank' },
    { label: 'Summit Bank', value: 'Summit Bank' },
    { label: 'Bank of Punjab (BOP)', value: 'BOP' },
    { label: 'Bank of Khyber (BOK)', value: 'BOK' },

    { label: 'Telenor Microfinance Bank', value: 'Telenor Microfinance' },
    { label: 'U Microfinance Bank (U Bank)', value: 'U Bank' },
    { label: 'Khushhali Microfinance Bank', value: 'Khushhali Bank' },
    { label: 'FINCA Microfinance Bank', value: 'FINCA' },
    { label: 'Mobilink Microfinance Bank', value: 'Mobilink Bank' }
];

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

    // ✅ Submit
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
                    <Dropdown
                        value={form.bankName}
                        options={bankOptions}
                        onChange={(e) => handleChange('bankName', e.value)}
                        placeholder="Select Bank"
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
