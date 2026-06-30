import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { checklistAPI } from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const formatSize = (b) => b ? (b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`) : '-';

const StatusBadge = ({ status }) => {
  const map = { completed: ['badge-completed', 'Selesai'], processing: ['badge-processing', 'Diproses'], failed: ['badge-failed', 'Gagal'], draft: ['badge-draft', 'Draft'] };
  const [cls, label] = map[status] || ['badge-draft', status];
  return <span className={cls}>{label}</span>;
};

export default function ChecklistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    checklistAPI.getById(id)
      .then(({ data }) => {
        setChecklist(data.checklist);
        setPhotos(data.photos);
      })
      .catch(() => {
        toast.error('Checklist tidak ditemukan');
        navigate('/checklist/history');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Hapus checklist ini? Tindakan tidak dapat dibatalkan.`)) return;
    setDeleting(true);
    try {
      await checklistAPI.delete(id);
      toast.success('Checklist dihapus');
      navigate('/checklist/history');
    } catch {
      toast.error('Gagal menghapus');
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    const url = checklistAPI.downloadUrl(id);
    const a = document.createElement('a');
    a.href = url;
    a.download = checklist.result_pdf_filename || `checklist_${id}.pdf`;
    a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!checklist) return null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-5">
        <Link to="/checklist/history" className="hover:text-samara-accent">History</Link>
        <span>â€º</span>
        <span className="text-stone-900 font-medium truncate max-w-xs">{checklist.title}</span>
      </div>

      {/* Header card */}
      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-stone-900">{checklist.title}</h1>
              <StatusBadge status={checklist.status} />
            </div>
            <p className="text-sm text-stone-500">{checklist.template_name} Â· {checklist.template_code}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {checklist.status === 'completed' && (
              <button onClick={handleDownload} className="btn-primary text-sm py-2">ðŸ“¥ Download PDF</button>
            )}
            <button onClick={handleDelete} disabled={deleting} className="btn-danger text-sm py-2">
              {deleting ? '...' : 'ðŸ—‘ Hapus'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Details */}
        <div className="card p-5">
          <h2 className="font-semibold text-stone-900 mb-4 text-sm">Informasi Checklist</h2>
          <dl className="space-y-3">
            {[
              ['Dibuat oleh', checklist.full_name],
              ['Username', checklist.username],
              ['Lokasi', checklist.location || '-'],
              ['Tanggal', formatDate(checklist.created_at)],
              ['Ukuran PDF', formatSize(checklist.result_pdf_size)],
              ['Jumlah Foto', `${photos.length} foto`],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm gap-3">
                <dt className="text-stone-500 shrink-0">{key}</dt>
                <dd className="font-medium text-stone-900 text-right">{val}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Notes */}
        <div className="card p-5">
          <h2 className="font-semibold text-stone-900 mb-3 text-sm">Catatan / Remarks</h2>
          {checklist.notes ? (
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{checklist.notes}</p>
          ) : (
            <p className="text-sm text-stone-400 italic">Tidak ada catatan</p>
          )}
        </div>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-stone-900 mb-4 text-sm">Foto Dokumentasi ({photos.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div key={photo.id} className="rounded-lg overflow-hidden border border-stone-200">
                <div className="aspect-square bg-stone-100 flex items-center justify-center">
                  <span className="text-stone-400 text-sm">Foto {idx + 1}</span>
                </div>
                {photo.photo_caption && (
                  <div className="px-2 py-1.5 bg-stone-50 border-t border-stone-200">
                    <p className="text-xs text-stone-600 line-clamp-2">{photo.photo_caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-3">
            * Preview foto tidak tersedia di browser untuk alasan keamanan. Foto sudah termasuk di dalam PDF yang didownload.
          </p>
        </div>
      )}
    </div>
  );
}

