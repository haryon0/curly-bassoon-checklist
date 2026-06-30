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
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6">
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm mb-4">LT</div>
            <h2 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h2>
            <p className="text-sm text-gray-500 mt-1">PT. Lombok Torok Developments</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-2" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Mendaftar...</>
              ) : 'Daftar'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
