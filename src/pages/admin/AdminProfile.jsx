import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProfileRedirect = () => {
  return <Navigate to="/admin/settings" replace />;
};

export default AdminProfileRedirect;