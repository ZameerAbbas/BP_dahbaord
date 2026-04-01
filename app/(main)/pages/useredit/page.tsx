'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

import { listenDepositOrdersPendingByUserID, listenWithdrawalOrdersPendingByUserID, OrderType, updateOrder, updateUser, UserType } from '@/firebaseUtils';

const statusOptions = [
    { label: 'Approved', value: 'Approve' }, // Matches "Approved" in the image
    { label: 'Reject', value: 'Reject' },
    { label: 'Pending', value: 'Pending' },
];

export default function UserEditPage() {
    const router = useRouter();
    const [errors, setErrors] = useState<any>({});
    const [user, setUser] = useState<UserType>({
        uid: '',
        email: '',
        displayName: '',
        userName: '',
        isAccepted: false,
        isAdmin: false,
        createdAt: '',
        bpPassword: '',
        bpUsername: '',
        phoneNumber: '',
        updatedAt: null
    });

    const [depositOrders, setDepositOrders] = useState<OrderType[]>([]);
    const [withdrawalOrders, setWithdrawalOrders] = useState<OrderType[]>([]);

    const [loading, setLoading] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const data = localStorage.getItem('userData');
        if (data) {
            setUser(JSON.parse(data));
        }
        setLoading(false);
    }, []);

    const handleChange = (field: keyof UserType, value: any) => {
        setUser(prev => ({ ...prev, [field]: value }));
    };


    useEffect(() => {
        const data = localStorage.getItem('userData');

        if (data) {
            const parsedUser = JSON.parse(data);
            setUser(parsedUser);
            const unsubscribeDeposits = listenDepositOrdersPendingByUserID(
                parsedUser.uid,
                setDepositOrders
            );
            const unsubscribeWithdrawals = listenWithdrawalOrdersPendingByUserID(
                parsedUser.uid,
                setWithdrawalOrders
            )
            return () => {
                unsubscribeDeposits();
                unsubscribeWithdrawals();
            };
        }

        setLoading(false);
    }, []);




    const validate = () => {
        const newErrors: any = {};

        if (!user.displayName?.trim()) newErrors.displayName = "Display Name is required";
        if (!user.userName?.trim()) newErrors.userName = "User Name is required";
        if (!user.bpUsername?.trim()) newErrors.bpUsername = "BP Username is required";
        if (!user.bpPassword?.trim()) newErrors.bpPassword = "BP Password is required";
        if (!user.phoneNumber?.trim()) newErrors.phoneNumber = "Phone Number is required";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };



    console.log('Deposit Orders:', depositOrders);
    console.log('Withdrawal Orders:', withdrawalOrders);






    const updateOrdersWithUserData = async () => {
        if (!user?.uid) return;

        try {
            const allOrders = [...depositOrders, ...withdrawalOrders];

            const updates = allOrders.map((order) =>
                updateOrder(user.uid, order.id, {
                    ...order,
                    userName: user.displayName,
                    bpId: user.bpUsername,
                    bpPassword: user.bpPassword
                })
            );

            await Promise.all(updates);

            console.log("All orders updated with latest user data");
        } catch (error) {
            console.error("Error updating orders:", error);
        }
    };



    const saveHandle = async () => {

        if (!validate()) return;
        const { uid, ...updates } = user;
        await updateUser(uid, updates);
        updateOrdersWithUserData()
        localStorage.removeItem('userData');
        router.push('/pages/userdetails');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="surface-ground p-4" style={{ minHeight: '100vh' }}>
            <div className="card p-6 shadow-2 border-round surface-card max-w-full">
                {/* 2 Column Responsive Grid */}
                <div className="grid p-fluid">

                    {/* Row 1: Name & Phone */}
                    <div className="col-12 md:col-8">
                        <label className="block font-medium mb-2">Name</label>
                        <InputText
                            value={user.displayName}
                            onChange={(e) => handleChange("displayName", e.target.value)}
                            className={`w-full ${errors.displayName ? 'border-red-500' : ''}`}
                        />
                        {errors.displayName && (
                            <small className="text-red-500">{errors.displayName}</small>
                        )}
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="block font-medium mb-2">Phone</label>
                        <InputText
                            value={user.phoneNumber}
                            onChange={(e) => handleChange("phoneNumber", e.target.value)}
                            className={`w-full ${errors.phoneNumber ? 'border-red-500' : ''}`}
                        />
                        {errors.phoneNumber && <small className="text-red-500">{errors.phoneNumber}</small>}
                    </div>

                    {/* Row 2: User Name (Full Width in its row based on image) */}
                    <div className="col-12 md:col-8">
                        <label className="block font-medium mb-2">User Name</label>
                        <InputText
                            value={user.userName}
                            onChange={(e) => handleChange("userName", e.target.value)}
                            className={`w-full ${errors.userName ? 'border-red-500' : ''}`}
                        />
                        {errors.userName && <small className="text-red-500">{errors.userName}</small>}
                    </div>
                    <div className="col-12 md:col-4"></div> {/* Spacer to keep username left-aligned */}

                    {/* Row 3: Email & BP Username */}
                    <div className="col-12 md:col-8">
                        <label className="block font-medium mb-2">email</label>
                        <InputText
                            value={user.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="email.."
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="block font-medium mb-2">BP Username</label>
                        <InputText
                            value={user.bpUsername}
                            onChange={(e) => handleChange("bpUsername", e.target.value)}
                            className={`w-full ${errors.bpUsername ? 'border-red-500' : ''}`}
                        />
                        {errors.bpUsername && <small className="text-red-500">{errors.bpUsername}</small>}
                    </div>

                    {/* Row 4: BP Password & Status */}
                    <div className="col-12 md:col-8">
                        <label className="block font-medium mb-2">BP Password</label>
                        <InputText
                            type="password"
                            value={user.bpPassword}
                            onChange={(e) => handleChange("bpPassword", e.target.value)}
                            className={`w-full ${errors.bpPassword ? 'border-red-500' : ''}`}
                        />
                        {errors.bpPassword && <small className="text-red-500">{errors.bpPassword}</small>}
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="block font-medium mb-2">Status</label>
                        <Dropdown
                            value={user.isAccepted ? 'Approve' : 'Pending'}
                            options={statusOptions}
                            onChange={(e) => handleChange('isAccepted', e.value === 'Approve')}
                            placeholder="Select status"
                        />
                    </div>

                    {/* Row 5: Password & Confirm Password */}
                    <div className="col-12 md:col-8">
                        <label className="block font-medium mb-2">Password</label>
                        <InputText
                            type="password"
                            placeholder="password.."
                            onChange={(e) => handleChange('bpPassword', e.target.value)} // Assuming this updates main password
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label className="block font-medium mb-2">Confirm Password</label>
                        <InputText
                            value={confirmPassword}
                            type="password"
                            placeholder="cnfrm password.."
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                {/* Submit Button aligned like the image */}
                <div className="mt-6 flex justify-center">
                    <Button
                        label="Update"
                        className="p-button-success px-6"
                        onClick={saveHandle}
                        style={{ backgroundColor: '#28a745', border: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
}
