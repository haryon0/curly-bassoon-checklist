import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { checklistAPI } from '../services/api';

const formatSize = (b) => b ? (b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`) : '-';

export default function Success() {
  const { id } = useParams();
  const [checklist, setChecklist] = useState(null);

  useEffect(() => {
    checklistAPI.getById(id)
      .then(({ data }) => setChecklist(data.checklist))
      .catch(console.error);
  }, [id]);

  const handleDownload = () => {
    const url = checklistAPI.downloadUrl(id);
    const a = document.createElement('a');
    a.href = url;
    a.download = checklist?.result_pdf_filename || `checklist_${id}.pdf`;
    a.click();
  };

  return (
    <div className="max-w-lg mx-auto mt-16 px-4">
      <div className="card p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="h1-title mb-2">PDF Berhasil Dibuat!</h1>
        <p className="body-text mb-6">
          Checklist Anda telah disimpan dan PDF telah berhasil digenerate.
        </p>

        {checklist && (
          <div className="bg-stone-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Judul</span>
              <span className="font-medium text-stone-900 text-right max-w-xs truncate">{checklist.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Template</span>
              <span className="font-medium text-stone-900">{checklist.template_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Lokasi</span>
              <span className="font-medium text-stone-900">{checklist.location || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Ukuran PDF</span>
              <span className="font-medium text-stone-900">{formatSize(checklist.result_pdf_size)}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button onClick={handleDownload} className="btn-primary w-full justify-center py-3">
            📥 Download PDF
          </button>
          <Link to="/checklist/new" className="btn-secondary w-full justify-center py-3">
            ➕ Buat Checklist Baru
          </Link>
          <Link to="/checklist/history" className="block text-sm text-link text-center mt-2">
            Lihat semua checklist →
          </Link>
        </div>
      </div>
    </div>
  );
}
