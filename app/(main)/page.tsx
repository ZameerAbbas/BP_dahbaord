/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { getUserCounts } from '@/firebaseUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard = () => {

    const { layoutConfig } = useContext(LayoutContext);

    const [counts, setCounts] = useState<{ total: number; active: number; inactive: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            setLoading(true);
            try {
                const result = await getUserCounts();
                setCounts(result);
            } catch (err) {
                console.error('Error fetching user counts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCounts();
    }, []);

    if (loading || !counts) {
        return <LoadingSpinner text="Loading dashboard..." fullPage />;
    }

    const { total: totalUsers, active: activeUsers, inactive: inactiveUsers } = counts;

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
