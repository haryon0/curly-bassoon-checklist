import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { checklistAPI } from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const formatSize = (b) => b ? (b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`) : '-';

const StatusBadge = ({ status }) => {
  const map = {
    completed: ['badge-completed', 'Selesai'],
    processing: ['badge-processing', 'Proses'],
    failed: ['badge-failed', 'Gagal'],
    draft: ['badge-draft', 'Draft'],
  };
  const [cls, label] = map[status] || ['badge-draft', status];
  return <span className={cls}>{label}</span>;
};

export default function History() {
  const [checklists, setChecklists] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback((page = 1) => {
    setLoading(true);
    checklistAPI.list({ page, limit: 10 })
      .then(({ data }) => {
        setChecklists(data.checklists);
        setPagination(data.pagination);
      })
      .catch(() => toast.error('Gagal memuat history'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(1); }, [load]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Hapus checklist "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeleting(id);
    try {
      await checklistAPI.delete(id);
      toast.success('Checklist dihapus');
      load(pagination.page);
    } catch {
      toast.error('Gagal menghapus checklist');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (id, filename) => {
    const url = checklistAPI.downloadUrl(id);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History Checklist</h1>
          <p className="text-sm text-gray-500 mt-1">Total: {pagination.total} checklist</p>
        </div>
        <Link to="/checklist/new" className="btn-primary">➕ New Checklist</Link>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Memuat...</div>
        ) : checklists.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 text-sm mb-4">Belum ada checklist</p>
            <Link to="/checklist/new" className="btn-primary">Buat Checklist Pertama</Link>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-4">Judul</div>
              <div className="col-span-2">Template</div>
              <div className="col-span-2">Lokasi</div>
              <div className="col-span-1 text-center">Foto</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>

            <div className="divide-y divide-gray-100">
              {checklists.map((item) => (
                <div key={item.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center">
                    {/* Title + date */}
                    <div className="sm:col-span-4 mb-2 sm:mb-0">
                      <Link to={`/checklist/${item.id}`} className="font-medium text-gray-900 hover:text-brand-600 text-sm line-clamp-1">
                        {item.title}
                      </Link>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(item.created_at)}</div>
                    </div>
                    <div className="sm:col-span-2 text-sm text-gray-600 truncate hidden sm:block">{item.template_code || '-'}</div>
                    <div className="sm:col-span-2 text-sm text-gray-500 truncate hidden sm:block">{item.location || '-'}</div>
                    <div className="sm:col-span-1 text-center text-sm text-gray-500 hidden sm:block">{item.photo_count}</div>
                    <div className="sm:col-span-1 hidden sm:block"><StatusBadge status={item.status} /></div>

                    {/* Mobile extras */}
                    <div className="flex items-center gap-2 sm:hidden mb-3">
                      <StatusBadge status={item.status} />
                      <span className="text-xs text-gray-400">{item.photo_count} foto</span>
                      <span className="text-xs text-gray-400">· {item.template_code}</span>
                    </div>

                    {/* Actions */}
                    <div className="sm:col-span-2 flex items-center gap-1.5 justify-end">
                      <Link to={`/checklist/${item.id}`} className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                        Detail
                      </Link>
                      {item.status === 'completed' && (
                        <button
                          onClick={() => handleDownload(item.id, item.result_pdf_filename || `checklist_${item.id}.pdf`)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-brand-200 text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          📥
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        disabled={deleting === item.id}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting === item.id ? '...' : '🗑'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Halaman {pagination.page} dari {pagination.pages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => load(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                  >← Prev</button>
                  <button
                    onClick={() => load(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
