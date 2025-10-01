import React from 'react';
    import { Outlet, useLocation, Navigate } from 'react-router-dom';
    import AdminLayout from '@/components/admin/AdminLayout';

    const AdminRoot = () => {
        const location = useLocation();

        if (location.pathname === '/admin' || location.pathname === '/admin/') {
            return <Navigate to="/admin/dashboard" replace />;
        }

        return (
            <AdminLayout>
                <Outlet />
            </AdminLayout>
        );
    };

    export default AdminRoot;