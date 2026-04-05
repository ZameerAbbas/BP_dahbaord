// export default AppTopbar;

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { useRouter } from 'next/navigation';
import { Avatar } from 'primereact/avatar';

import { OverlayPanel } from 'primereact/overlaypanel';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar, logout, currentUser } = useContext(LayoutContext);
    const router = useRouter();
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);

    const op = useRef<OverlayPanel>(null);

    const handleLogout = async () => {
        await logout();
    };

    // Navigate to manager profile
    const goToProfile = () => {
        router.push('/pages/mangerProfile');
    };

    // Get first character of user's name
    const userInitial = (currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase();
    console.log('Current User in AppTopbar:', currentUser); // Debugging line
    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    console.log('User Initial:', userInitial);

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo flex items-center gap-2  ">
                {/* <div
                    style={{
                        backgroundColor: layoutConfig.colorScheme === 'dark' ? '#79B6E8' : '#6366f1',
                        color: layoutConfig.colorScheme === 'dark' ? '#ffffff' : '#ffffff',
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <span style={{ fontWeight: 600, fontSize: '16px' }}>Mm</span>
                </div>   */}
                <img src={'https://betprodeals.com/public/logos/mm_logo_name.png'}  alt='Mm'/>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <div className="mt-2">
                    <Avatar label={userInitial} shape="circle" className="bg-primary text-white" style={{ width: '32px', height: '32px', fontSize: '14px' }} onClick={goToProfile} />
                </div>

                <button
                    type="button"
                    className="p-link layout-topbar-button"
                    onClick={(e) => op.current?.toggle(e)} // show/hide on click
                >
                    <i className="pi pi-sign-out"></i>
                    <span>Logout</span>
                </button>

                <OverlayPanel
                    ref={op}
                    showCloseIcon={false}
                    dismissable={true} // click outside to close
                    id="overlay_logout"
                    style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
                >
                    <button
                        className="p-button p-button-sm p-button-warning w-full"
                        onClick={() => {
                            handleLogout();
                            op.current?.hide(); // hide after logout
                        }}
                    >
                        Click to Logout
                    </button>
                </OverlayPanel>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
