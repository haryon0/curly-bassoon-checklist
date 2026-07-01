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
    <div className="min-h-screen bg-[#FCFAF5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Warning banner */}
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-700 font-medium">⚠️ Ubah Password Diperlukan</p>
          <p className="text-xs text-amber-600 mt-1">Silakan set password baru sebelum melanjutkan</p>
        </div>

        <div className="card p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="h1-title mb-2">Ubah Password</h1>
            <p className="body-text">
              Ini adalah login pertama Anda. Silakan ubah password untuk melanjutkan.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Password Baru *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="Minimal 8 karakter"
                required
              />
            </div>

            <div>
              <label className="label">Konfirmasi Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Ulangi password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-success w-full">
              {loading ? 'Mengubah...' : 'Ubah Password & Lanjutkan'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-stone-100 border border-stone-200 rounded-lg">
            <p className="text-xs text-stone-700">
              ℹ️ Password harus minimal 8 karakter untuk keamanan akun Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
