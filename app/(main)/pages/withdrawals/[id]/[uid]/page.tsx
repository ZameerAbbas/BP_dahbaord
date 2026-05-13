'use client';

import { useEffect, useState } from 'react';
import { getOrderById, OrderType, updateOrder } from '@/firebaseUtils';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';

import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';

const statusOptions = [
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' }
];

const WithdrawalDetailsPage = ({
    params
}: {
    params: {
        id: string;
        uid: string;
    };
}) => {
    const orderId = params.id;
    const uid = params.uid;
    const router = useRouter();

    const [form, setForm] = useState<OrderType | null>(null);
    const [loading, setLoading] = useState(false);

    const [preview, setPreview] = useState<string>('');

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            const data = await getOrderById(uid, orderId);

            console.log('Fetched Order Data:', data);
            setForm({ ...data, id: orderId, uid: uid });
            setPreview(data.screenshotAdmin || '');
        };

        fetchOrder();
    }, [orderId, uid]);
    const handleChange = (field: keyof OrderType, value: any) => {
        if (!form) return;
        setForm({ ...form, [field]: value });
    };

    console.log('Form State:', form);

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
            <div className="col-12">
                <div className="p-3 border-round bg-gray-100">
                    <h3 className="mb-3">Withdrawal Details</h3>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <p>
                                <strong>Account Holder:</strong> {form.userName || '-'}
                            </p>
                        </div>

                        <div className="col-12 md:col-6">
                            <p>
                                <strong>Account Number:</strong> {form.accountNumber || '-'}
                            </p>
                        </div>

                        <div className="col-12 md:col-6">
                            <p>
                                <strong>Method:</strong> {form.paymentMethod || '-'}
                            </p>
                        </div>

                        <div className="col-12 md:col-6">
                            <p>
                                <strong>Amount:</strong> PKR {form.amount || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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

export default WithdrawalDetailsPage;
