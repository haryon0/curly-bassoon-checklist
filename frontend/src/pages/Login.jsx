import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login gagal. Periksa kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-md">
        <div
          className="p-8 rounded-xl border border-stone-200 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBF7 100%)',
          }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <img
              src="/samara-logo.png"
              alt="Samara Lombok"
              className="h-14 w-auto mx-auto mb-4 object-contain"
              style={{ maxWidth: '200px' }}
            />
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Masuk ke Akun</h1>
            <p className="text-sm text-stone-600">Gunakan username atau email Anda</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Username / Email</label>
              <input
                type="text"
                className="input"
                placeholder="Masukkan username atau email"
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="body-small">
              Belum punya akun?{' '}
              <Link to="/register" className="text-link">
                Daftar sekarang
              </Link>
            </p>
          </div>

          <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700 font-medium">Demo Admin:</p>
            <p className="text-xs text-amber-600">Username: admin · Password: Admin@1234</p>
          </div>
        </div>

        {/* Brand info */}
        <div className="mt-8 text-center text-stone-600">
          <p className="text-sm font-medium">Samara Lombok</p>
          <p className="text-xs mt-1 opacity-75">Checklist Management System</p>
        </div>
      </div>
    </div>
  );
}
