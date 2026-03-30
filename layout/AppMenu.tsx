/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';

import { AppMenuItem } from '@/types';
import Link from 'next/link';

const AppMenu = () => {
    // const { layoutConfig } = useContext(LayoutContext);

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
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}

            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
