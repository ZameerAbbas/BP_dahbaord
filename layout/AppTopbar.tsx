// /* eslint-disable @next/next/no-img-element */

// import Link from 'next/link';
// import { classNames } from 'primereact/utils';
// import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
// import { AppTopbarRef } from '@/types';
// import { LayoutContext } from './context/layoutcontext';
// import { useRouter } from 'next/navigation';

// const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
//     const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar, logout, currentUser } = useContext(LayoutContext);
//     const router = useRouter();
//     const menubuttonRef = useRef(null);
//     const topbarmenuRef = useRef(null);
//     const topbarmenubuttonRef = useRef(null);

//     const handleLogout = async () => {
//         await logout();
//     };

//     useImperativeHandle(ref, () => ({
//         menubutton: menubuttonRef.current,
//         topbarmenu: topbarmenuRef.current,
//         topbarmenubutton: topbarmenubuttonRef.current
//     }));

//     return (
//         <div className="layout-topbar">
//             <Link href="/" className="layout-topbar-logo">
//                 <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" />
//                 <span>Mathmatics</span>
//             </Link>

//             <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
//                 <i className="pi pi-bars" />
//             </button>

//             <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
//                 <i className="pi pi-ellipsis-v" />
//             </button>

//             <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
//                 <button type="button" className="p-link layout-topbar-button">
//                     <i className="pi pi-user"></i>
//                     <span>Profile</span>
//                 </button>
//                 <button type="button" className="p-link layout-topbar-button" onClick={handleLogout}>
//                     <i className="pi pi-sign-out"></i>
//                     <span>Logout</span>
//                 </button>
//             </div>
//         </div>
//     );
// });

// AppTopbar.displayName = 'AppTopbar';

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
            <Link href="/" className="layout-topbar-logo flex items-center gap-2">
                {/* <img
                    src="/layout/images/logo.jpeg"
                    width={47}
                    height={35}
                    className="rounded-full"
                    alt="logo"
                /> */}
                <span className="font-semibold text-lg">MM</span>
            </Link>

            <button
                ref={menubuttonRef}
                type="button"
                className="p-link layout-menu-button layout-topbar-button"
                onClick={onMenuToggle}
            >
                <i className="pi pi-bars" />
            </button>

            <button
                ref={topbarmenubuttonRef}
                type="button"
                className="p-link layout-topbar-menu-button layout-topbar-button"
                onClick={showProfileSidebar}
            >
                <i className="pi pi-ellipsis-v" />
            </button>

            <div
                ref={topbarmenuRef}
                className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}
            >

                <div className='mt-2'>


                    <Avatar
                        label={userInitial}
                        shape="circle"
                        className="bg-primary text-white"
                        style={{ width: '32px', height: '32px', fontSize: '14px' }}
                        onClick={goToProfile}
                    />
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
                    dismissable={true}    // click outside to close
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
