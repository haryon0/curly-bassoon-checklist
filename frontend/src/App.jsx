import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChangePasswordRequired from './pages/ChangePasswordRequired';
import TemplateSelect from './pages/TemplateSelect';
import ChecklistForm from './pages/ChecklistForm';
import Success from './pages/Success';
import History from './pages/History';
import ChecklistDetail from './pages/ChecklistDetail';
import AdminTemplates from './pages/AdminTemplates';
import AdminUsers from './pages/AdminUsers';

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePasswordRequired />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/checklist/new" element={<TemplateSelect />} />
            <Route path="/checklist/new/:templateId" element={<ChecklistForm />} />
            <Route path="/checklist/success/:id" element={<Success />} />
            <Route path="/checklist/history" element={<History />} />
            <Route path="/checklist/:id" element={<ChecklistDetail />} />
            <Route path="/admin/templates" element={<AdminTemplates />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
