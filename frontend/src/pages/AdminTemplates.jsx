import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { templatesAPI } from '../services/api';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true,
  });
  const fileInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    templatesAPI.list()
      .then(({ data }) => setTemplates(data.templates))
      .catch(() => toast.error('Gagal memuat template'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast.error('Nama dan kode harus diisi');
      return;
    }

    // For create: PDF is required
    if (!editingId && !fileInputRef.current?.files?.[0]) {
      toast.error('PDF harus diupload');
      return;
    }

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('code', formData.code);
    fd.append('description', formData.description);
    fd.append('is_active', formData.is_active);

    if (fileInputRef.current?.files?.[0]) {
      fd.append('pdf', fileInputRef.current.files[0]);
    }

    setSubmitting(editingId || 'create');

    try {
      if (editingId) {
        await templatesAPI.update(editingId, fd);
        toast.success('Template berhasil diupdate');
      } else {
        await templatesAPI.create(fd);
        toast.success('Template berhasil dibuat');
      }
      setShowCreateForm(false);
      setEditingId(null);
      setFormData({ name: '', code: '', description: '', is_active: true });
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal simpan template');
    } finally {
      setSubmitting(null);
    }
  };

  const handleEdit = (template) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      code: template.code,
      description: template.description || '',
      is_active: template.is_active,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await templatesAPI.delete(id);
      toast.success('Template berhasil dihapus');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal hapus template');
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingId(null);
    setFormData({ name: '', code: '', description: '', is_active: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Template</h1>
            <p className="text-sm text-gray-500 mt-1">Buat, edit, dan hapus template checklist.</p>
          </div>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              ➕ Template Baru
            </button>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Template' : 'Template Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nama Template</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Contoh: HVAC Maintenance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Kode Template</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Contoh: MEP_HVAC_001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Deskripsi</label>
              <textarea
                className="input resize-none"
                rows="3"
                placeholder="Deskripsi template..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="label">File PDF {!editingId && <span className="text-red-600">*</span>}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      if (file.size > 50 * 1024 * 1024) {
                        toast.error('File terlalu besar (max 50MB)');
                        e.target.value = '';
                      }
                    }
                  }}
                  className="hidden"
                  id="pdf-input"
                />
                <label htmlFor="pdf-input" className="cursor-pointer">
                  <div className="text-4xl mb-2">📄</div>
                  <div className="text-sm text-gray-600">
                    {fileInputRef.current?.files?.[0]?.name || 'Klik untuk upload PDF atau drag-drop'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Max 50MB</div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {submitting ? '⏳ Menyimpan...' : editingId ? '💾 Update' : '✨ Buat Template'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      {loading ? (
        <div className="card p-12 text-center text-gray-400">Memuat template...</div>
      ) : templates.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          Belum ada template. Buat yang pertama sekarang!
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                    {t.code?.split('_')[0] || 'PDF'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">Kode: {t.code}</div>
                    {t.description && (
                      <div className="text-xs text-gray-500 mt-1">{t.description}</div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      {t.has_pdf ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          ✅ PDF tersedia
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                          ⚠️ Belum ada PDF
                        </span>
                      )}
                      {t.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          ✨ Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-50 px-2 py-0.5 rounded-full">
                          ⊘ Nonaktif
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(t)}
                    disabled={!!submitting || !!deleting}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id || !!submitting}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleting === t.id ? '⏳' : '🗑️'} {deleting === t.id ? 'Hapus...' : 'Hapus'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400">
        * Hanya user dengan role <strong>admin</strong> yang bisa akses halaman ini.
        Tidak bisa menghapus template yang sudah digunakan dalam checklist.
      </p>
    </div>
  );
}
