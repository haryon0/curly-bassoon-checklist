import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checklistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatSize = (bytes) => {
  if (!bytes) return '-';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const StatusBadge = ({ status }) => {
  const cls = {
    completed: 'badge-completed',
    processing: 'badge-processing',
    failed: 'badge-failed',
    draft: 'badge-draft',
  }[status] || 'badge-draft';
  const label = { completed: 'Selesai', processing: 'Proses', failed: 'Gagal', draft: 'Draft' }[status] || status;
  return <span className={cls}>{label}</span>;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.password_reset_required) {
      navigate('/change-password');
    }
  }, [user?.password_reset_required, navigate]);

  useEffect(() => {
    checklistAPI.stats()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ icon, label, value, color }) => (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <span className="material-symbols-rounded">{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-stone-900">{loading ? '—' : value}</div>
        <div className="text-sm text-stone-500">{label}</div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Selamat datang, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-stone-500 text-sm mt-1">Samara Lombok — Checklist Management System</p>
        </div>
        <Link to="/checklist/new" className="btn-primary">
          <span className="material-symbols-rounded">add</span> New Checklist
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="description" label="Total Checklist" value={data?.stats?.total || 0} color="bg-blue-50 text-blue-600" />
        <StatCard icon="check_circle" label="Selesai" value={data?.stats?.completed || 0} color="bg-green-50 text-green-600" />
        <StatCard icon="schedule" label="Diproses" value={data?.stats?.processing || 0} color="bg-yellow-50 text-yellow-600" />
        <StatCard icon="calendar_today" label="Hari Aktif" value={data?.stats?.active_days || 0} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Recent */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Checklist Terbaru</h2>
          <Link to="/checklist/history" className="text-sm text-samara-accent hover:underline">Lihat semua →</Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-stone-400 text-sm">Memuat...</div>
        ) : !data?.recent?.length ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-stone-500 text-sm mb-4">Belum ada checklist. Mulai dengan membuat yang pertama!</p>
            <Link to="/checklist/new" className="btn-primary">Buat Checklist</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recent.map((item) => (
              <Link key={item.id} to={`/checklist/${item.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-samara-accent font-bold text-xs shrink-0">
                  {item.template_code || 'PDF'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-900 text-sm truncate">{item.title}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{item.template_name} · {item.location || 'Lokasi tidak tersedia'} · {item.photo_count} foto</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-stone-400 hidden sm:block">{formatDate(item.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
