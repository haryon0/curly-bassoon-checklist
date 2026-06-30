import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checklistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UserManagementTab from '../components/UserManagement/UserManagementTab';

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
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checklistAPI.stats()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ icon, label, value, color }) => (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{loading ? '—' : value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );

  const DashboardContent = () => (
    <>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">PT. Lombok Torok Developments — MEP Checklist Management</p>
        </div>
        <Link to="/checklist/new" className="btn-primary">
          <span>➕</span> New Checklist
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📋" label="Total Checklist" value={data?.stats?.total || 0} color="bg-blue-50 text-blue-600" />
        <StatCard icon="✅" label="Selesai" value={data?.stats?.completed || 0} color="bg-green-50 text-green-600" />
        <StatCard icon="⏳" label="Diproses" value={data?.stats?.processing || 0} color="bg-yellow-50 text-yellow-600" />
        <StatCard icon="📅" label="Hari Aktif" value={data?.stats?.active_days || 0} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Recent */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Checklist Terbaru</h2>
          <Link to="/checklist/history" className="text-sm text-brand-600 hover:underline">Lihat semua →</Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
        ) : !data?.recent?.length ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 text-sm mb-4">Belum ada checklist. Mulai dengan membuat yang pertama!</p>
            <Link to="/checklist/new" className="btn-primary">Buat Checklist</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recent.map((item) => (
              <Link key={item.id} to={`/checklist/${item.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs shrink-0">
                  {item.template_code || 'PDF'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.template_name} · {item.location || 'Lokasi tidak tersedia'} · {item.photo_count} foto</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-gray-400 hidden sm:block">{formatDate(item.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="max-w-7xl">
      {/* Tab Navigation */}
      <div className="mb-8 flex gap-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'dashboard'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Dashboard
        </button>
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'admin'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 User Management
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <DashboardContent />}
      {activeTab === 'admin' && user?.role === 'admin' && <UserManagementTab />}
    </div>
  );
}
