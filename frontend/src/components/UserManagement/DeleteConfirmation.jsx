import React, { useState } from 'react';

export default function DeleteConfirmation({ user, onConfirm, onCancel, disabledReason }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Hapus User</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {disabledReason ? (
            <>
              <div className="text-sm text-gray-600 mb-4">
                <strong>Tidak dapat menghapus user ini:</strong>
              </div>
              <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
                <p className="text-sm text-red-800">{disabledReason}</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4">
                Yakin ingin menghapus user <strong>{user?.username}</strong>?
              </div>
              <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
                <p className="text-sm text-red-800">⚠️ Tindakan ini tidak dapat dibatalkan!</p>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          {!disabledReason && (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
