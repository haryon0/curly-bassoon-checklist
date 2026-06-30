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
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-brand-600 flex-col justify-between p-12">
        <div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">LT</div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-3">MEP Checklist<br />Management System</h1>
          <p className="text-brand-200 text-sm leading-relaxed">
            Digitalisasi checklist maintenance MEP — dokumentasikan, foto, dan generate PDF laporan secara otomatis.
          </p>
        </div>
        <div className="text-brand-300 text-xs">© 2024 PT. Lombok Torok Developments</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Masuk ke Akun</h2>
            <p className="text-sm text-gray-500 mt-1">Gunakan username atau email Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              Daftar sekarang
            </Link>
          </p>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">Demo Admin:</p>
            <p className="text-xs text-blue-600">Username: admin · Password: Admin@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
