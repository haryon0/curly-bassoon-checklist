import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function UserForm({
  user,
  onSubmit,
  onClose,
  onOpenChangePassword,
}) {
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'user',
    is_active: true,
  });
  const [tempPassword, setTempPassword] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [user, isEdit]);

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error('Nama lengkap harus diisi');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email harus diisi');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email tidak valid');
      return false;
    }
    if (!isEdit && !formData.username.trim()) {
      toast.error('Username harus diisi');
      return false;
    }
    if (!isEdit && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('Username hanya boleh berisi huruf, angka, dan underscore');
      return false;
    }
    if (!isEdit && (formData.username.length < 3 || formData.username.length > 20)) {
      toast.error('Username harus 3-20 karakter');
      return false;
    }
    if (formData.full_name.length > 100) {
      toast.error('Nama lengkap maksimal 100 karakter');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await onSubmit(formData);
      if (result?.temporary_password) {
        setTempPassword(result.temporary_password);
      } else {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit User' : 'Buat User Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            ✕
          </button>
        </div>

        {/* Temp Password Alert */}
        {tempPassword && (
          <div className="px-6 pt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-green-900 mb-2">✓ User dibuat berhasil!</div>
              <div className="text-xs text-green-800 mb-3">
                Password sementara (share dengan user, hanya ditampilkan sekali):
              </div>
              <div className="bg-white border border-green-200 rounded px-3 py-2 font-mono text-sm text-green-900 flex items-center justify-between">
                <code>{tempPassword}</code>
                <button
                  onClick={() => copyToClipboard(tempPassword)}
                  className="text-green-600 hover:text-green-900 ml-2"
                >
                  📋
                </button>
              </div>
              <button
                onClick={onClose}
                className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Selesai
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {!tempPassword && (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Username - only on create */}
            {!isEdit && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                  placeholder="john_doe"
                />
              </div>
            )}

            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                placeholder="john@example.com"
              />
            </div>

            {/* Role */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Aktif</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {isEdit && (
                <button
                  type="button"
                  onClick={onOpenChangePassword}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  🔑 Ubah Password
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Buat'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
