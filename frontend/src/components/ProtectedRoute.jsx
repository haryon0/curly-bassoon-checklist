import React from 'react';
import { Outlet } from 'react-router-dom';

// TESTING MODE: All routes accessible without authentication
export default function ProtectedRoute() {
  return <Outlet />;
}
