'use client';

import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import {
    createSupport,
    getAllSupport,
    supportType,
    updateSupport
} from '@/firebaseUtils';



const Support = () => {
    const [form, setForm] = useState<supportType>({
        uid: '',
        supportNumber: ''
    });

    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);

    // ✅ Load existing data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getAllSupport();

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
    const handleChange = (field: keyof supportType, value: string) => {
        setForm({ ...form, [field]: value });
    };

    // ✅ Submit / Update
    const handleSubmit = async () => {
        try {
            if (isEdit && form.uid) {
                // Update existing support
                await updateSupport(form.uid, form);
                alert('Support number updated successfully');
            } else {
                // Create new support
                const newSupport = await createSupport(form);
                setForm(newSupport); // set uid from new entry
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
            <h3 className="mb-4 text-xl font-bold">Support Number</h3>

            <div className="grid">



                <div className="col-12 md:col-3">
                    <label>Support Number</label>
                    <InputText
                        value={form?.supportNumber}
                        onChange={(e) => handleChange('supportNumber', e.target.value)}
                        placeholder="+92..."
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

export default Support;
