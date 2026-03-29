/* eslint-disable @next/next/no-img-element */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { classNames } from 'primereact/utils';
import { LayoutContext } from './context/layoutcontext';

import { OverlayPanel } from 'primereact/overlaypanel';
import Link from 'next/link';
import AppConfig from './AppConfig';
import { listenDepositOrdersPending, OrderType, listenWithdrawalOrdersPending, getAllPendingUsers, UserType } from '@/firebaseUtils';

const AppRightSidebar = () => {
    const { layoutState } = useContext(LayoutContext);
    const op = useRef<OverlayPanel>(null);
    const opu = useRef<OverlayPanel>(null);
    const [configVisible, setConfigVisible] = useState(false);

    const [loading, setLoading] = useState(true);
    const [deposits, setDeposits] = useState<OrderType[]>([]);
    const [withdrawal, setWithdrawal] = useState<OrderType[]>([]);
    const [pendingUsers, setPendingUsers] = useState<UserType[]>([]);

    useEffect(() => {
        const unsubscribe = listenDepositOrdersPending((depositList) => {
            setDeposits(depositList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    useEffect(() => {
        const unsubscribe = listenWithdrawalOrdersPending((withdrawalsList) => {
            setWithdrawal(withdrawalsList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    useEffect(() => {
        const unsubscribe = getAllPendingUsers((pendingUsers) => {
            setPendingUsers(pendingUsers);

        });

        return () => unsubscribe();
    }, []);



    const totalPending = deposits.length + withdrawal.length;

    return (
        <div
            className={classNames('layout-right-sidebar', {
                'layout-right-sidebar-active': layoutState.profileSidebarVisible
            })}
        >
            <div className="layout-right-sidebar-content">
                {/* Notification Icon */}
                <button
                    type="button"
                    className="p-link layout-right-sidebar-button relative"
                    title="Notifications"
                    onClick={(e) => op.current?.toggle(e)}
                >
                    <i className="pi pi-bell text-xl"></i>

                    {/* Show blinking dot with pulsing border when there are pending orders */}
                    {totalPending > 0 && (
                        <div className="notification-wrapper">
                            <div className="notification-border"></div>
                            <div className="notification-dot"></div>
                        </div>
                    )}
                </button>
                <button
                    type="button"
                    className="p-link layout-right-sidebar-button relative"
                    title="Users"
                    onClick={(e) => opu.current?.toggle(e)}
                >
                    <i className="pi pi-flag text-xl"></i>

                    {/* Show blinking dot with pulsing border when there are pending orders */}
                    {pendingUsers?.length > 0 && (
                        <div className="user-wrapper">
                            <div className="user-border"></div>
                            <div className="user-dot"></div>
                        </div>
                    )}
                </button>
                {/* Messages Icon */}




                <AppConfig />




            </div>

            <OverlayPanel
                ref={op}
                dismissable
                className="w-80 h-80"



            >
                <div>
                    <p>Notifications</p>

                    <div className="">
                        {/* Deposits */}
                        <Link href="/pages/deposits" onClick={(e) => op.current?.toggle(e)}>
                            <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                <i className="pi pi-download text-green-500"></i>
                                <span>Pending Deposits ({deposits?.length})</span>
                            </div>
                        </Link>

                        {/* Withdrawals */}
                        <Link href="/pages/withdrawals" onClick={(e) => op.current?.toggle(e)}>
                            <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                <i className="pi pi-upload text-red-500"></i>
                                <span>Pending Withdrawals ({withdrawal?.length})</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </OverlayPanel>
            <OverlayPanel
                ref={opu}
                dismissable
                className="w-80 h-80"



            >
                <div>
                    <p>Pending Users</p>

                    <div className="">
                        {/* Deposits */}
                        <Link href="/pages/userdetails" onClick={(e) => opu.current?.toggle(e)}>
                            <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                <i className="pi pi-download text-green-500"></i>
                                <span>Pending Users ({pendingUsers?.length})</span>
                            </div>
                        </Link>


                    </div>
                </div>
            </OverlayPanel>


            {configVisible && <AppConfig simple={false} />}
        </div>
    );
};



export default AppRightSidebar;
