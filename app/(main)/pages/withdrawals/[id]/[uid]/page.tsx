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
    const [imageSize, setImageSize] = useState<string>('');

    // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];

    //     if (!file || !form) return;

    //     // Convert bytes to KB / MB
    //     const sizeInKB = file.size / 1024;
    //     const sizeInMB = sizeInKB / 1024;

    //     const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(2)} MB` : `${sizeInKB.toFixed(2)} KB`;

    //     setImageSize(formattedSize);

    //     const reader = new FileReader();

    //     reader.onload = () => {
    //         const base64 = reader.result as string;

    //         setForm((prev) =>
    //             prev
    //                 ? {
    //                       ...prev,
    //                       screenshotAdmin: base64
    //                   }
    //                 : prev
    //         );

    //         setPreview(base64);
    //     };

    //     reader.readAsDataURL(file);
    // };

    const [dragActive, setDragActive] = useState(false);

    const processFile = (file: File) => {
        if (!file || !form) return;

        // Image Size
        const sizeInKB = file.size / 1024;
        const sizeInMB = sizeInKB / 1024;

        const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(2)} MB` : `${sizeInKB.toFixed(2)} KB`;

        setImageSize(formattedSize);

        // Convert to Base64
        const reader = new FileReader();

        reader.onload = () => {
            const base64 = reader.result as string;

            setForm((prev) =>
                prev
                    ? {
                          ...prev,
                          screenshotAdmin: base64
                      }
                    : prev
            );

            setPreview(base64);
        };

        reader.readAsDataURL(file);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        processFile(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setDragActive(false);

        const file = e.dataTransfer.files?.[0];

        if (!file) return;

        processFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setDragActive(false);
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
                        <div className="col-12 md:col-6">
                            <p>
                                <strong>BP User:</strong> {form.bpId || '-'}
                            </p>
                        </div>

                        <div className="col-12 md:col-6">
                            <p>
                                <strong>Order Number:</strong> {form.orderNumber || '-'}
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
                {/* Upload Screenshot */}
                {/* Upload Screenshot */}
                <div className="col-12">
                    <label className="block mb-2 font-medium">{imageSize ? `Attachment (${imageSize})` : 'Attachment'}</label>

                    <div
                        onClick={() => document.getElementById('screenshot-upload')?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        style={{
                            border: dragActive ? '2px dashed #3b82f6' : '1px solid #d1d5db',
                            borderRadius: '10px',
                            minHeight: '260px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            background: dragActive ? '#eff6ff' : '#fff',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <input id="screenshot-upload" type="file" accept="image/*" onChange={handleImageChange} hidden />

                        {preview ? (
                            <div className='p-4'>

                            <img
                                src={preview}
                                alt="preview"
                                style={{
                                    width: '80%',
                                    height: '250px',
                                    objectFit: 'contain'
                                }}
                                />
                                </div>
                        ) : (
                            <div
                                style={{
                                    textAlign: 'center',
                                    color: '#9ca3af'
                                }}
                            >
                                <i
                                    className="pi pi-cloud-upload"
                                    style={{
                                        fontSize: '3rem',
                                        marginBottom: '10px',
                                        display: 'block'
                                    }}
                                />

                                <span
                                    style={{
                                        fontSize: '16px'
                                    }}
                                >
                                    Drag and drop a file here or click
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-4">
                <Button label="Update Order" loading={loading} onClick={handleSubmit} />
            </div>
        </div>
    );
};

export default WithdrawalDetailsPage;
