import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAPI } from '../services/userAPI';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordRequired() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (newPassword.length < 8) {
      toast.error('Password minimal 8 karakter');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password tidak cocok');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // User changes their own password
      const selfUserId = user.id;
      await userAPI.changePassword(selfUserId, newPassword);

      // Update user in context to clear password_reset_required flag
      setUser({
        ...user,
        password_reset_required: false,
      });

      toast.success('Password berhasil diubah');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal ubah password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ubah Password</h1>
            <p className="text-gray-600 text-sm">
              Ini adalah login pertama Anda. Silakan ubah password untuk melanjutkan.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                placeholder="Minimal 8 karakter"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                placeholder="Ulangi password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Mengubah...' : 'Ubah Password & Lanjutkan'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              ℹ️ Password harus minimal 8 karakter untuk keamanan akun Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
