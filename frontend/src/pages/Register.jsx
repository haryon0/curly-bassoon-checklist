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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FCFAF5]"
      style={{
        backgroundImage: 'linear-gradient(135deg, #324720 0%, #D4A648 100%)',
      }}
    >
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-samara-primary flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
              LT
            </div>
            <h1 className="h1-title mb-2">Buat Akun Baru</h1>
            <p className="body-text">PT. Lombok Torok Developments</p>
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
        <div className="mt-8 text-center text-white">
          <p className="text-sm font-medium">PT. Lombok Torok Developments</p>
          <p className="text-xs mt-1 opacity-75">Checklist Management System</p>
        </div>
      </div>
    </div>
  );
}
