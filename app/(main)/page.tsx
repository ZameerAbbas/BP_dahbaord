/* eslint-disable @next/next/no-img-element */
'use client';

import { Menu } from 'primereact/menu';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import Link from 'next/link';
import { Demo } from '@/types';
import { ChartOptions } from 'chart.js';
import { getDatabase, ref, get } from 'firebase/database';
import { db } from '@/firebase';

interface UserType {
    uid: string;
    isAccepted: boolean;
    displayName: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
}
const Dashboard = () => {

    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);

    const [users, setUsers] = useState<UserType[]>([]);

    const fetchUsers = async () => {
        try {
            const snapshot = await get(ref(db, 'users'));
            if (snapshot.exists()) {
                const usersObj = snapshot.val();
                const userList: UserType[] = Object.entries(usersObj).map(([uid, data]: [string, any]) => ({
                    uid,
                    ...data,
                }));
                setUsers(userList);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const applyLightTheme = () => {
        const lineOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };

        setLineOptions(lineOptions);
    };

    const applyDarkTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                }
            }
        };

        setLineOptions(lineOptions);
    };



    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isAccepted).length;
    const inactiveUsers = users.filter((u) => !u.isAccepted).length;



    return (
        <div className="grid">
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Users</span>
                            <div className="text-900 font-medium text-xl">{totalUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-blue-500 text-xl" />
                        </div>
                    </div>

                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Active Users</span>
                            <div className="text-900 font-medium text-xl">{activeUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-green-500 text-xl" />
                        </div>
                    </div>

                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">In Active Users</span>
                            <div className="text-900 font-medium text-xl">{inactiveUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-red-500 text-xl" />
                        </div>
                    </div>

                </div>
            </div>





        </div>
    );
};

export default Dashboard;
