import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ChangePasswordForm({ user, onSubmit, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password minimal 8 karakter');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    try {
      await onSubmit(newPassword);
      toast.success('Password berhasil diubah');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Ubah Password</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-900">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm text-stone-600 mb-1">User: {user?.username}</label>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-1">Password Baru *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-brand-600"
              placeholder="Minimal 8 karakter"
            />
            <div className="text-xs text-stone-500 mt-1">Minimal 8 karakter</div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-samara-primary text-white rounded-lg hover:bg-samara-primary disabled:opacity-50"
            >
              {loading ? 'Mengubah...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

