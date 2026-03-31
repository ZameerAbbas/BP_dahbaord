/* eslint-disable @next/next/no-img-element */

import React, { useContext, useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';

import { auth } from '@/firebase'; // adjust path if needed

import { AppMenuItem } from '@/types';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';

const AppMenu = () => {
    // const { layoutConfig } = useContext(LayoutContext);

    const { currentUser } = useContext(LayoutContext);

    const userInitial = currentUser?.displayName ? currentUser.displayName : currentUser?.email ? currentUser.email : 'Admin';


    const model: AppMenuItem[] = [
        {
            label: '',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: '',
            items: [{ label: 'Users List', icon: 'pi pi-fw pi-users', to: '/pages/users' }]
        },
        {
            label: '',
            items: [{ label: 'Widthdrawal time', icon: 'pi pi-fw pi-users', to: '/pages/withdrawaltime' }]
        },
        {
            label: '',
            items: [{ label: 'User Details', icon: 'pi pi-fw pi-user', to: '/pages/userdetail' }]
        },
        {
            label: '',
            items: [{ label: 'Deposits', icon: 'pi pi-fw pi-download', to: '/pages/deposits' }]
        },
        {
            label: '',
            items: [{ label: 'Bank Info', icon: 'pi pi-fw pi-upload', to: '/pages/bankinfo' }]
        },
        {
            label: '',
            items: [{ label: 'Withdrawals', icon: 'pi pi-fw pi-upload', to: '/pages/withdrawals' }]
        },
        {
            label: '',
            items: [{ label: 'Support', icon: 'pi pi-fw pi-phone', to: '/pages/support' }]
        }
    ];

    return (
        <MenuProvider>
            <div className="flex items-center p-3 border-b">
                <div className=" p-3 border-b">
                    <div>
                        <span className="text-sm font-medium text-gray-800">
                            {userInitial || 'Guest'}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500">
                            Manager
                        </span>
                    </div>
                </div>

            </div>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}

            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
