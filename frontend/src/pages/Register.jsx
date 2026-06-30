import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      return toast.error('Password dan konfirmasi password tidak cocok');
    }
    if (form.password.length < 8) {
      return toast.error('Password minimal 8 karakter');
    }
    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, full_name: form.full_name, password: form.password });
      toast.success('Registrasi berhasil!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-md">
        <div
          className="p-8 rounded-xl border border-stone-200 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBF7 100%)',
          }}
        >
          <div className="mb-8 text-center">
            <img
              src="/samara-logo.png"
              alt="Samara Lombok"
              className="h-14 w-auto mx-auto mb-4 object-contain"
              style={{ maxWidth: '200px' }}
            />
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Buat Akun Baru</h1>
            <p className="text-sm text-stone-600">Samara Lombok</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nama Lengkap</label>
              <input type="text" className="input" placeholder="Nama lengkap Anda" value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Username</label>
                <input type="text" className="input" placeholder="username_anda" value={form.username} onChange={set('username')} required pattern="[a-zA-Z0-9_]+" title="Hanya huruf, angka, dan underscore" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="email@contoh.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 8 karakter" value={form.password} onChange={set('password')} required minLength={8} />
            </div>
            <div>
              <label className="label">Konfirmasi Password</label>
              <input type="password" className="input" placeholder="Ulangi password" value={form.confirm_password} onChange={set('confirm_password')} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Mendaftar...</>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="body-small">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-link">
                Masuk di sini
              </Link>
            </p>
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
