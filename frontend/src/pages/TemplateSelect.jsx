import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { templatesAPI } from '../services/api';

export default function TemplateSelect() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    templatesAPI.list()
      .then(({ data }) => setTemplates(data.templates))
      .catch(() => toast.error('Gagal memuat template'))
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
    if (!selected) return toast.warn('Pilih template terlebih dahulu');
    navigate(`/checklist/new/${selected.id}`);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
          <span>New Checklist</span>
          <span>â€º</span>
          <span className="text-stone-900 font-medium">Pilih Template</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Pilih Template Checklist</h1>
        <p className="text-stone-500 text-sm mt-1">Pilih template yang akan digunakan sebagai dasar checklist Anda.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-samara-primary text-white text-xs flex items-center justify-center font-bold">1</div>
          <span className="text-sm font-medium text-samara-accent">Pilih Template</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 text-stone-400 text-xs flex items-center justify-center font-bold">2</div>
          <span className="text-sm text-stone-400">Isi Form & Upload Foto</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 text-stone-400 text-xs flex items-center justify-center font-bold">3</div>
          <span className="text-sm text-stone-400">Generate PDF</span>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-stone-400 text-sm">Memuat template...</div>
      ) : templates.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">ðŸ“„</div>
          <p className="text-stone-500 text-sm">Belum ada template tersedia. Hubungi administrator.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`w-full text-left card p-4 transition-all hover:shadow-md ${
                selected?.id === t.id ? 'border-brand-500 ring-2 ring-brand-500 bg-brand-50' : 'hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  selected?.id === t.id ? 'bg-samara-primary text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {t.code?.split('_')[0] || 'DOC'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{t.name}</span>
                    {!t.has_pdf && (
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">Belum ada PDF</span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">Kode: {t.code}</div>
                  {t.description && <div className="text-sm text-stone-600 mt-1 truncate">{t.description}</div>}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  selected?.id === t.id ? 'border-brand-600 bg-samara-primary' : 'border-stone-300'
                }`}>
                  {selected?.id === t.id && <span className="text-white text-xs">âœ“</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">â† Kembali</button>
        <button onClick={handleNext} className="btn-primary" disabled={!selected || loading}>
          Lanjutkan â†’
        </button>
      </div>
    </div>
  );
}

