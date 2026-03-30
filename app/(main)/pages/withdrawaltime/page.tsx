'use client';

import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import {
    getAllWithdrawalTimes,
    createWithdrawalTime,
    withdrawalTimeType,
    updateWithdrawalTime
} from '@/firebaseUtils';



const WithdrawalTiming = () => {
    const [form, setForm] = useState<withdrawalTimeType>({
        uid: '',
        fromtime: '',
        toTime: '',
        WhatappNumber: '',
        url: ''
    });

    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);

    // ✅ Load existing data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getAllWithdrawalTimes();

            if (data) {
                const firstEntry = Object.values(data)[0];
                setForm(firstEntry);
                setIsEdit(true);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    // ✅ Handle change
    const handleChange = (field: keyof withdrawalTimeType, value: string) => {
        setForm({ ...form, [field]: value });
    };

    // ✅ Submit / Update
    const handleSubmit = async () => {

        try {
            if (isEdit && form.uid) {
                // Update existing support
                await updateWithdrawalTime(form.uid, form);
                alert('Support number updated successfully');
            } else {
                // Create new support
                const newSupport = await createWithdrawalTime(form);
                setForm(newSupport);
                alert('Support number created successfully');
            }

            setIsEdit(true);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card">
            <h3 className="mb-4 text-xl font-bold">Withdrawals Timing</h3>

            <div className="grid">

                <div className="col-12 md:col-3">
                    <label>From Time</label>
                    <InputText
                        value={form?.fromtime}
                        onChange={(e) => handleChange('fromtime', e.target.value)}
                        placeholder="13:00"
                        className="w-full"
                    />
                </div>

                <div className="col-12 md:col-3">
                    <label>To Time</label>
                    <InputText
                        value={form?.toTime}
                        onChange={(e) => handleChange('toTime', e.target.value)}
                        placeholder="18:00"
                        className="w-full"
                    />
                </div>

                <div className="col-12 md:col-3">
                    <label>WhatsApp Number</label>
                    <InputText
                        value={form?.WhatappNumber}
                        onChange={(e) => handleChange('WhatappNumber', e.target.value)}
                        placeholder="+447..."
                        className="w-full"
                    />
                </div>

                <div className="col-12 md:col-3">
                    <label>URL</label>
                    <InputText
                        value={form?.url}
                        onChange={(e) => handleChange('url', e.target.value)}
                        placeholder="https://..."
                        className="w-full"
                    />
                </div>

            </div>

            <div className="mt-4">
                <Button
                    label={isEdit ? 'Update' : 'Submit'}
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
};

export default WithdrawalTiming;
