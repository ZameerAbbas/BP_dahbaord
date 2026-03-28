// 'use client';
// import React, { useState, createContext } from 'react';
// import { LayoutState, ChildContainerProps, LayoutConfig, LayoutContextProps } from '@/types';
// export const LayoutContext = createContext({} as LayoutContextProps);

// export const LayoutProvider = ({ children }: ChildContainerProps) => {
//     const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
//         ripple: false,
//         inputStyle: 'outlined',
//         menuMode: 'static',
//         colorScheme: 'light',
//         theme: 'lara-light-indigo',
//         scale: 14
//     });

//     const [layoutState, setLayoutState] = useState<LayoutState>({
//         staticMenuDesktopInactive: false,
//         overlayMenuActive: false,
//         profileSidebarVisible: false,
//         configSidebarVisible: false,
//         staticMenuMobileActive: false,
//         menuHoverActive: false
//     });

//     const onMenuToggle = () => {
//         if (isOverlay()) {
//             setLayoutState((prevLayoutState) => ({ ...prevLayoutState, overlayMenuActive: !prevLayoutState.overlayMenuActive }));
//         }

//         if (isDesktop()) {
//             setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive }));
//         } else {
//             setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive }));
//         }
//     };

//     const showProfileSidebar = () => {
//         setLayoutState((prevLayoutState) => ({ ...prevLayoutState, profileSidebarVisible: !prevLayoutState.profileSidebarVisible }));
//     };

//     const isOverlay = () => {
//         return layoutConfig.menuMode === 'overlay';
//     };

//     const isDesktop = () => {
//         return window.innerWidth > 991;
//     };

//     const value: LayoutContextProps = {
//         layoutConfig,
//         setLayoutConfig,
//         layoutState,
//         setLayoutState,
//         onMenuToggle,
//         showProfileSidebar
//     };

//     return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
// };


'use client';
import React, { useState, createContext, useEffect, ReactNode } from 'react';
import { LayoutState, ChildContainerProps, LayoutConfig, LayoutContextProps } from '@/types';
import { auth } from '@/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export const LayoutContext = createContext({} as LayoutContextProps);

export const LayoutProvider = ({ children }: ChildContainerProps) => {
    const router = useRouter();

    // Layout config and state
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'light',
        theme: 'lara-light-indigo',
        scale: 14
    });

    const [layoutState, setLayoutState] = useState<LayoutState>({
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    });

    // Auth state
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Firebase auth listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/login'); // redirect if not logged in
            } else {
                setCurrentUser(user);
            }
            setLoadingAuth(false);
        });

        return () => unsubscribe();
    }, [router]);

    // Layout methods
    const onMenuToggle = () => {
        if (isOverlay()) {
            setLayoutState((prev) => ({ ...prev, overlayMenuActive: !prev.overlayMenuActive }));
        }

        if (isDesktop()) {
            setLayoutState((prev) => ({ ...prev, staticMenuDesktopInactive: !prev.staticMenuDesktopInactive }));
        } else {
            setLayoutState((prev) => ({ ...prev, staticMenuMobileActive: !prev.staticMenuMobileActive }));
        }
    };

    const showProfileSidebar = () => {
        setLayoutState((prev) => ({ ...prev, profileSidebarVisible: !prev.profileSidebarVisible }));
    };

    const isOverlay = () => layoutConfig.menuMode === 'overlay';
    const isDesktop = () => typeof window !== 'undefined' && window.innerWidth > 991;

    // Logout function
    const logout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value: LayoutContextProps = {
        layoutConfig,
        setLayoutConfig,
        layoutState,
        setLayoutState,
        onMenuToggle,
        showProfileSidebar,
        currentUser,
        logout
    };

    // Show nothing until auth is checked
    if (loadingAuth) return <div className="text-center mt-20">Loading...</div>;

    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};
