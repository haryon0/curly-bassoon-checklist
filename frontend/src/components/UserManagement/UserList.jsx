import React from 'react';

export default function UserList({
  users,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? (
      <span className="badge-admin">👤 Admin</span>
    ) : (
      <span className="badge-user">👤 User</span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="badge-completed">✔ Aktif</span>
    ) : (
      <span className="badge-failed">✗ Nonaktif</span>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="card">
      {/* Header with filters */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm text-stone-600 block mb-1">Cari</label>
            <input
              type="text"
              placeholder="Username, email, atau nama..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-brand-600"
            />
          </div>
          <div>
            <label className="text-sm text-stone-600 block mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-brand-600"
            >
              <option value="">Semua</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-stone-600 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-brand-600"
            >
              <option value="">Semua</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-stone-400 text-sm">Memuat...</div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-stone-500 text-sm">Tidak ada user yang ditemukan</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-stone-700">Username</th>
                <th className="px-5 py-3 text-left font-semibold text-stone-700">Nama Lengkap</th>
                <th className="px-5 py-3 text-left font-semibold text-stone-700">Email</th>
                <th className="px-5 py-3 text-left font-semibold text-stone-700">Role</th>
                <th className="px-5 py-3 text-left font-semibold text-stone-700">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-stone-700">Dibuat</th>
                <th className="px-5 py-3 text-left font-semibold text-stone-700">Terakhir Login</th>
                <th className="px-5 py-3 text-right font-semibold text-stone-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-stone-50">
                  <td className="px-5 py-4 text-stone-900 font-mono text-xs">{user.username}</td>
                  <td className="px-5 py-4 text-stone-900">{user.full_name}</td>
                  <td className="px-5 py-4 text-stone-600 text-xs">{user.email}</td>
                  <td className="px-5 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-5 py-4">{getStatusBadge(user.is_active)}</td>
                  <td className="px-5 py-4 text-stone-600 text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-4 text-stone-600 text-xs">{formatDate(user.last_login)}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-samara-accent hover:underline text-xs mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-stone-600">
            Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-2 border border-stone-200 rounded text-sm disabled:opacity-50"
            >
              ← Sebelumnya
            </button>
            <span className="px-3 py-2 text-sm">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-2 border border-stone-200 rounded text-sm disabled:opacity-50"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
