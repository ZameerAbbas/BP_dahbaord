/* eslint-disable @next/next/no-img-element */
import React, { useContext, useEffect, useState, useRef } from 'react';
import { LayoutContext } from './context/layoutcontext';
import Link from 'next/link';
import { OverlayPanel } from 'primereact/overlaypanel';
import { listenDepositOrdersPending, listenWithdrawalOrdersPending, getAllPendingUsers, OrderType, UserType } from '@/firebaseUtils';
import AppConfig from './AppConfig';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    // OverlayPanel refs
    const opDeposits = useRef<OverlayPanel>(null);
    const opUsers = useRef<OverlayPanel>(null);

    const [configVisible, setConfigVisible] = useState(false);

    // Data states
    const [deposits, setDeposits] = useState<OrderType[]>([]);
    const [withdrawals, setWithdrawals] = useState<OrderType[]>([]);
    const [pendingUsers, setPendingUsers] = useState<UserType[]>([]);

    useEffect(() => {
        const unsubDep = listenDepositOrdersPending(setDeposits);
        const unsubWith = listenWithdrawalOrdersPending(setWithdrawals);
        const unsubUsers = getAllPendingUsers(setPendingUsers);

        return () => {
            unsubDep();
            unsubWith();
            unsubUsers();
        };
    }, []);

    const totalPending = deposits.length + withdrawals.length;

    return (
        <div
            className={`layout-footer p-4 flex justify-between items-center relative `}
            style={{
                backgroundColor: layoutConfig.colorScheme === 'dark' ? '#2A323D' : '#ffffff',
            
            }}
        >
            {/* <span className="text-sm text-gray-500">© 2026 Your Company</span> */}

            {/* MOBILE-ONLY FOOTER SIDEBAR */}
            <div className="mobile-footer-sidebar flex-row justify-center items-center gap-4 md:hidden">
                {/* Notifications (Deposits) */}
                <button className="relative p-2 rounded-full hover:bg-gray-100" onClick={(e) => opDeposits.current?.toggle(e)}>
                    <i className="pi pi-bell text-xl"></i>
                    {totalPending > 0 && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                </button>
                <OverlayPanel ref={opDeposits} dismissable className="w-64">
                    <p className="font-semibold">Notifications</p>
                    <Link href="/pages/deposits" onClick={() => opDeposits.current?.hide()}>
                        <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                            <i className="pi pi-download text-green-500"></i>
                            <span>Pending Deposits ({deposits.length})</span>
                        </div>
                    </Link>
                    <Link href="/pages/withdrawals" onClick={() => opDeposits.current?.hide()}>
                        <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                            <i className="pi pi-upload text-red-500"></i>
                            <span>Pending Withdrawals ({withdrawals.length})</span>
                        </div>
                    </Link>
                </OverlayPanel>

                {/* Users */}
                <button className="relative p-2 rounded-full hover:bg-gray-100" onClick={(e) => opUsers.current?.toggle(e)}>
                    <i className="pi pi-user text-xl"></i>
                    {pendingUsers.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 animate-ping"></span>}
                </button>
                <OverlayPanel ref={opUsers} dismissable className="w-64">
                    <p className="font-semibold">Pending Users</p>
                    <Link href="/pages/userdetails" onClick={() => opUsers.current?.hide()}>
                        <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                            <i className="pi pi-user text-green-500"></i>
                            <span>Pending Users ({pendingUsers.length})</span>
                        </div>
                    </Link>
                </OverlayPanel>

                {/* Withdrawals */}
                <AppConfig />

                {configVisible && <AppConfig simple={false} />}
            </div>
        </div>
    );
};

export default AppFooter;
