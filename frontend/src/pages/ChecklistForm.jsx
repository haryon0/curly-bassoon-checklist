import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { templatesAPI, checklistAPI } from '../services/api';

// ─── Annotation Tools ────────────────────────────────────────────
const TOOLS = [
  { id: 'checkmark', label: 'Checkmark', icon: '✓', color: '#16a34a' },
  { id: 'crossmark', label: 'Crossmark', icon: '✗', color: '#dc2626' },
  { id: 'text',      label: 'Type Text', icon: 'A',  color: '#1d4ed8' },
  { id: 'dot',       label: 'Dot',       icon: '●',  color: '#111827' },
  { id: 'circle',    label: 'Circle',    icon: '○',  color: '#d97706' },
  { id: 'crossout',  label: 'Cross Out', icon: '—',  color: '#7c3aed' },
  { id: 'eraser',    label: 'Eraser',    icon: '⌫',  color: '#6b7280' },
];

const ANNOT_PT = 20; // px size for drawing on canvas

function drawAnnot(ctx, a, cw, ch) {
  const x = a.normX * cw;
  const y = a.normY * ch;
  const s = ANNOT_PT;

  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (a.type) {
    case 'checkmark':
      ctx.strokeStyle = '#16a34a';
      ctx.beginPath();
      ctx.moveTo(x - s * 0.4, y + s * 0.1);
      ctx.lineTo(x - s * 0.05, y + s * 0.45);
      ctx.lineTo(x + s * 0.55, y - s * 0.35);
      ctx.stroke();
      break;
    case 'crossmark':
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(x - s * 0.4, y - s * 0.4);
      ctx.lineTo(x + s * 0.4, y + s * 0.4);
      ctx.moveTo(x + s * 0.4, y - s * 0.4);
      ctx.lineTo(x - s * 0.4, y + s * 0.4);
      ctx.stroke();
      break;
    case 'dot':
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'circle':
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.9, s * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'crossout':
      ctx.strokeStyle = '#7c3aed';
      ctx.beginPath();
      ctx.moveTo(x - s * 1.3, y);
      ctx.lineTo(x + s * 1.3, y);
      ctx.stroke();
      break;
    case 'text':
      ctx.fillStyle = '#1d4ed8';
      ctx.font = `${s * 0.85}px Inter, sans-serif`;
      ctx.fillText(a.text || '', x, y);
      break;
    default:
      break;
  }
  ctx.restore();
}

// ─── Component ───────────────────────────────────────────────────
const MAX_PHOTOS = 20;
const MAX_SIZE_MB = 5;

export default function ChecklistForm() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  // Template
  const [template, setTemplate] = useState(null);

  // Form fields
  const [form, setForm] = useState({ title: '', location: '', notes: '' });

  // Photos
  const [photos, setPhotos]   = useState([]);
  const [dragOver, setDragOver] = useState(false);

  // PDF.js
  const [pdfReady, setPdfReady]     = useState(false);
  const [pdfDoc, setPdfDoc]         = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pdfCanvasRef  = useRef(null);
  const annotCanvasRef = useRef(null);
  const containerRef  = useRef(null);
  const renderingRef  = useRef(false); // prevent concurrent renders

  // Annotations: { [pageNum]: [{type, normX, normY, text?, id}] }
  const [activeTool, setActiveTool] = useState('checkmark');
  const [annotations, setAnnotations] = useState({});
  const [textInput, setTextInput]   = useState(null); // {x, y, normX, normY}
  const [textValue, setTextValue]   = useState('');
  const textInputRef = useRef(null);

  // Submit
  const [submitting, setSubmitting]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ── Load template ────────────────────────────────────────────
  useEffect(() => {
    templatesAPI.getById(templateId)
      .then(({ data }) => {
        setTemplate(data.template);
        setForm(f => ({ ...f, title: data.template.name }));
      })
      .catch(() => { toast.error('Template tidak ditemukan'); navigate('/checklist/new'); });
  }, [templateId]);

  // ── Load PDF.js from CDN ─────────────────────────────────────
  useEffect(() => {
    if (window.pdfjsLib) { setPdfReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfReady(true);
    };
    s.onerror = () => toast.error('Gagal memuat PDF viewer');
    document.head.appendChild(s);
  }, []);

  // ── Fetch & load PDF bytes ───────────────────────────────────
  useEffect(() => {
    if (!pdfReady || !template?.has_pdf) return;
    const token = localStorage.getItem('token');
    fetch(`/api/templates/${templateId}/view?token=${token}`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.arrayBuffer(); })
      .then(data => window.pdfjsLib.getDocument({ data }).promise)
      .then(doc => { setPdfDoc(doc); setTotalPages(doc.numPages); setCurrentPage(1); })
      .catch(() => toast.error('Gagal memuat PDF template'));
  }, [pdfReady, template, templateId]);

  // ── Render PDF page ──────────────────────────────────────────
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDoc || !pdfCanvasRef.current || !containerRef.current) return;
    if (renderingRef.current) return;
    renderingRef.current = true;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const containerW = containerRef.current.clientWidth || 800;
      const vp1 = page.getViewport({ scale: 1 });
      const scale = containerW / vp1.width;
      const viewport = page.getViewport({ scale });

      const pdfCanvas = pdfCanvasRef.current;
      pdfCanvas.width  = viewport.width;
      pdfCanvas.height = viewport.height;

      const aCanvas = annotCanvasRef.current;
      aCanvas.width  = viewport.width;
      aCanvas.height = viewport.height;

      await page.render({ canvasContext: pdfCanvas.getContext('2d'), viewport }).promise;
      redrawAnnotations(pageNum, viewport.width, viewport.height);
    } catch (e) {
      console.error('Render error:', e);
    } finally {
      renderingRef.current = false;
    }
  }, [pdfDoc]);

  useEffect(() => { renderPage(currentPage); }, [pdfDoc, currentPage, renderPage]);

  // ── Redraw annotations ───────────────────────────────────────
  const redrawAnnotations = useCallback((pageNum, cw, ch) => {
    const canvas = annotCanvasRef.current;
    if (!canvas) return;
    const w = cw || canvas.width;
    const h = ch || canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    (annotations[pageNum] || []).forEach(a => drawAnnot(ctx, a, w, h));
  }, [annotations]);

  useEffect(() => {
    if (annotCanvasRef.current) {
      redrawAnnotations(currentPage, annotCanvasRef.current.width, annotCanvasRef.current.height);
    }
  }, [annotations, currentPage, redrawAnnotations]);

  // ── Canvas click handler ─────────────────────────────────────
  const handleAnnotClick = useCallback((e) => {
    const canvas = annotCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // Scale pixel position to canvas resolution
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    const normX = x / canvas.width;
    const normY = y / canvas.height;

    if (activeTool === 'eraser') {
      setAnnotations(prev => {
        const list = [...(prev[currentPage] || [])];
        let closest = -1, minDist = 40 / canvas.width;
        list.forEach((a, i) => {
          const d = Math.hypot(a.normX - normX, a.normY - normY);
          if (d < minDist) { minDist = d; closest = i; }
        });
        if (closest >= 0) list.splice(closest, 1);
        return { ...prev, [currentPage]: list };
      });
      return;
    }

    if (activeTool === 'text') {
      // Show floating input at click position
      const rect2 = canvas.getBoundingClientRect();
      setTextInput({ clientX: e.clientX - rect2.left, clientY: e.clientY - rect2.top, normX, normY });
      setTextValue('');
      setTimeout(() => textInputRef.current?.focus(), 30);
      return;
    }

    setAnnotations(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), { type: activeTool, normX, normY, id: Date.now() }],
    }));
  }, [activeTool, currentPage]);

  const confirmText = () => {
    if (textInput && textValue.trim()) {
      setAnnotations(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), { type: 'text', normX: textInput.normX, normY: textInput.normY, text: textValue, id: Date.now() }],
      }));
    }
    setTextInput(null);
    setTextValue('');
  };

  const undoLast = () => {
    setAnnotations(prev => {
      const list = [...(prev[currentPage] || [])];
      list.pop();
      return { ...prev, [currentPage]: list };
    });
  };

  const clearPage = () => {
    if (!window.confirm('Hapus semua anotasi di halaman ini?')) return;
    setAnnotations(prev => ({ ...prev, [currentPage]: [] }));
  };

  // ── Photos ───────────────────────────────────────────────────
  const addFiles = useCallback((files) => {
    const valid = [];
    for (const file of files) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.warn(`${file.name}: format tidak didukung`); continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.warn(`${file.name}: melebihi ${MAX_SIZE_MB}MB`); continue;
      }
      valid.push({ file, preview: URL.createObjectURL(file), caption: '' });
    }
    setPhotos(prev => {
      const combined = [...prev, ...valid];
      if (combined.length > MAX_PHOTOS) { toast.warn(`Maks. ${MAX_PHOTOS} foto`); return combined.slice(0, MAX_PHOTOS); }
      return combined;
    });
  }, []);

  const removePhoto = (idx) => setPhotos(prev => {
    URL.revokeObjectURL(prev[idx].preview);
    return prev.filter((_, i) => i !== idx);
  });

  const updateCaption = (idx, caption) =>
    setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, caption } : p));

  const movePhoto = (from, to) => {
    if (to < 0 || to >= photos.length) return;
    const arr = [...photos];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setPhotos(arr);
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Judul wajib diisi');
    setSubmitting(true);
    setUploadProgress(0);

    const fd = new FormData();
    fd.append('template_id', templateId);
    fd.append('title', form.title);
    fd.append('location', form.location);
    fd.append('notes', form.notes);
    fd.append('annotations', JSON.stringify(annotations));

    const captions = {};
    photos.forEach((p, i) => { fd.append('photos', p.file); captions[i] = p.caption; });
    fd.append('captions', JSON.stringify(captions));

    try {
      const { data } = await checklistAPI.submit(fd, (ev) => {
        if (ev.total) setUploadProgress(Math.round(ev.loaded * 100 / ev.total));
      });
      navigate(`/checklist/success/${data.checklist_id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal submit checklist');
      setSubmitting(false);
    }
  };

  const totalAnnotCount = Object.values(annotations).reduce((s, a) => s + a.length, 0);

  if (!template) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <span>New Checklist</span><span>›</span><span>Pilih Template</span><span>›</span>
          <span className="text-gray-900 font-medium">Isi Form</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {template.name}
          <span className="text-gray-400 font-normal text-sm ml-2">— {template.code}</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── PDF Viewer ── */}
        <div className="card overflow-hidden">
          {/* Card header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">📄 Template PDF</span>
            {totalAnnotCount > 0 && (
              <span className="text-xs text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full font-medium">
                {totalAnnotCount} anotasi
              </span>
            )}
          </div>

          {/* Annotation Toolbar */}
          {template.has_pdf && (
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium mr-1">Tools:</span>
              {TOOLS.map(tool => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => { setActiveTool(tool.id); setTextInput(null); }}
                  title={tool.label}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeTool === tool.id
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  style={activeTool === tool.id ? {} : { color: tool.color }}
                >
                  <span className="text-base leading-none">{tool.icon}</span>
                  <span className="hidden sm:inline">{tool.label}</span>
                </button>
              ))}
              <div className="flex-1" />
              <button type="button" onClick={undoLast}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 font-medium">
                ↩ Undo
              </button>
              <button type="button" onClick={clearPage}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 font-medium">
                🗑 Hapus
              </button>
            </div>
          )}

          {/* PDF canvas area */}
          <div ref={containerRef} className="bg-gray-200 overflow-auto">
            {template.has_pdf ? (
              !pdfDoc ? (
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm h-64">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Memuat PDF...
                </div>
              ) : (
                <div className="relative" style={{ display: 'inline-block', width: '100%' }}>
                  {/* PDF render canvas */}
                  <canvas ref={pdfCanvasRef} style={{ display: 'block', width: '100%' }} />
                  {/* Annotation overlay canvas */}
                  <canvas
                    ref={annotCanvasRef}
                    onClick={handleAnnotClick}
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      cursor: activeTool === 'eraser' ? 'cell'
                            : activeTool === 'text'   ? 'text'
                            : 'crosshair',
                    }}
                  />
                  {/* Floating text input */}
                  {textInput && (
                    <div style={{ position: 'absolute', left: textInput.clientX, top: textInput.clientY - 12, zIndex: 20 }}>
                      <input
                        ref={textInputRef}
                        type="text"
                        value={textValue}
                        onChange={e => setTextValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') confirmText(); if (e.key === 'Escape') setTextInput(null); }}
                        onBlur={confirmText}
                        className="border-2 border-blue-500 rounded px-2 py-0.5 text-sm text-blue-700 bg-white/95 shadow-lg outline-none w-40"
                        placeholder="Ketik teks, Enter..."
                      />
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-sm">Template PDF belum diupload</p>
              </div>
            )}
          </div>

          {/* Page navigation */}
          {pdfDoc && totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-center gap-4">
              <button type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">
                ← Prev
              </button>
              <span className="text-sm text-gray-600">
                Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
              </span>
              <button type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">
                Next →
              </button>
            </div>
          )}
        </div>

        {/* ── Informasi Checklist ── */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Informasi Checklist</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Judul Checklist <span className="text-red-500">*</span></label>
              <input type="text" className="input"
                placeholder="Masukkan judul checklist"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required />
            </div>
            <div>
              <label className="label">Lokasi</label>
              <input type="text" className="input"
                placeholder="Contoh: Gedung A Lt. 3, Panel Room"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="label">Catatan / Remarks</label>
              <input type="text" className="input"
                placeholder="Catatan tambahan (opsional)"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        </div>

        {/* ── Foto Dokumentasi ── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Foto Dokumentasi</h2>
            <span className="text-xs text-gray-400">{photos.length}/{MAX_PHOTOS} foto</span>
          </div>

          {photos.length < MAX_PHOTOS && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4 ${
                dragOver ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'
              }`}
            >
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm text-gray-600 mb-2">Drag & drop foto di sini, atau</p>
              <label className="btn-secondary text-xs cursor-pointer">
                Pilih File
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="hidden"
                  onChange={e => { addFiles(Array.from(e.target.files)); e.target.value = ''; }} />
              </label>
              <p className="text-xs text-gray-400 mt-2">
                JPEG, PNG, WebP · Maks. {MAX_SIZE_MB}MB per foto · Maks. {MAX_PHOTOS} foto
              </p>
            </div>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative group">
                  <img src={photo.preview} alt="" className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => movePhoto(idx, idx - 1)} disabled={idx === 0}
                      className="w-5 h-5 bg-black/50 text-white rounded text-xs flex items-center justify-center disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => movePhoto(idx, idx + 1)} disabled={idx === photos.length - 1}
                      className="w-5 h-5 bg-black/50 text-white rounded text-xs flex items-center justify-center disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => removePhoto(idx)}
                      className="w-5 h-5 bg-red-500 text-white rounded text-xs flex items-center justify-center">✕</button>
                  </div>
                  <span className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">{idx + 1}</span>
                  <input type="text" className="input text-xs py-1 mt-1.5" placeholder="Caption..."
                    value={photo.caption}
                    onChange={e => updateCaption(idx, e.target.value)}
                    maxLength={200} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/checklist/new')} className="btn-secondary flex-1 justify-center" disabled={submitting}>
            ← Kembali
          </button>
          <button type="submit" className="btn-primary flex-1 justify-center" disabled={submitting}>
            {submitting ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {uploadProgress < 100 ? `Upload ${uploadProgress}%` : 'Generate PDF...'}
              </div>
            ) : '💾 Simpan & Generate PDF'}
          </button>
        </div>

        {submitting && (
          <div className="card p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-700">{uploadProgress < 100 ? 'Mengupload file...' : 'Membuat PDF...'}</span>
              <span className="text-sm text-brand-600 font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
