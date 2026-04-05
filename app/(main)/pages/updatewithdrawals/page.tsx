'use client';

import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

import { ref, get, update, child } from 'firebase/database';
import { db } from '@/firebase'; // your firebase config
import { useRouter } from 'next/navigation';
import { getOrderById, OrderType, updateOrder } from '@/firebaseUtils';

const statusOptions = [
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' }
];

const UpdateOrder = () => {
    const router = useRouter();

    const [form, setForm] = useState<OrderType | null>(null);
    const [loading, setLoading] = useState(false);

    const [preview, setPreview] = useState<string>('');

    const orderInfo = localStorage.getItem('orderInfo') ? JSON.parse(localStorage.getItem('orderInfo') as string) : null;

    const uid = orderInfo?.uid;
    const orderId = orderInfo?.orderId;

    console.log('Order Info from Local Storage:', orderInfo);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            const data = await getOrderById(uid, orderId);

            console.log('Fetched Order Data:', data);

            if (data) {
                setForm({ ...data, id: orderId, uid: uid });
                setPreview(data.screenshotAdmin || '');
            }
        };

        fetchOrder();
    }, [orderId]);
    console.log('Form State:', form);

    const handleChange = (field: keyof OrderType, value: any) => {
        if (!form) return;
        setForm({ ...form, [field]: value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !form) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;

            setForm((prev) => (prev ? { ...prev, screenshotAdmin: base64 } : prev));
            setPreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!form) return;

        try {
            setLoading(true);

            await updateOrder(uid, form.id, form);

            alert('Order updated successfully');
            localStorage.removeItem('orderInfo');
            router.push('/pages/withdrawals');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    if (!form) return <p className="text-center">Loading...</p>;

    return (
        <div className="card max-w-3xl mx-auto">
            <h2 className="text-center text-xl font-bold mb-4">Update Order</h2>

            <div className="grid">
                {/* Status */}
                <div className="col-12">
                    <label>Status</label>
                    <Dropdown value={form.status} options={statusOptions} onChange={(e) => handleChange('status', e.value)} placeholder="Select Status" className="w-full" />
                </div>

                {/* Notes */}
                <div className="col-12">
                    <label>Notes</label>
                    <InputTextarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={3} className="w-full" />
                </div>

                {/* Upload Screenshot */}
                <div className="col-12">
                    <label>Upload Screenshot</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                </div>

                {/* Preview */}
                {preview && (
                    <div className="col-12">
                        <label>Preview</label>
                        <img
                            src={preview}
                            alt="preview"
                            style={{
                           
                                width: '200px',
                                height: '200px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-center mt-4">
                <Button label="Update Order" loading={loading} onClick={handleSubmit} />
            </div>
        </div>
    );
};

export default UpdateOrder;
