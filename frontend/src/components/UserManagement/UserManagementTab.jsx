import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { userAPI } from '../../services/userAPI';
import { useAuth } from '../../context/AuthContext';
import UserList from './UserList';
import UserForm from './UserForm';
import ChangePasswordForm from './ChangePasswordForm';
import DeleteConfirmation from './DeleteConfirmation';

export default function UserManagementTab() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showUserForm, setShowUserForm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.list({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit,
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      toast.error('Gagal memuat user list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load users on mount and when filters change
  useEffect(() => {
    setPage(1); // Reset to page 1 when filters change
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [page, limit, search, roleFilter, statusFilter]);

  const handleCreateUser = async (formData) => {
    try {
      const { data } = await userAPI.create(formData);
      toast.success('User berhasil dibuat');
      loadUsers();
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal membuat user';
      toast.error(message);
      throw error;
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      await userAPI.update(editingUser.id, formData);
      toast.success('User berhasil diupdate');
      loadUsers();
      setShowUserForm(false);
      setEditingUser(null);
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal update user';
      toast.error(message);
    }
  };

  const handleChangePassword = async (newPassword) => {
    try {
      await userAPI.changePassword(editingUser.id, newPassword);
      toast.success('Password berhasil diubah');
      loadUsers();
      setShowChangePassword(false);
      setEditingUser(null);
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal ubah password';
      toast.error(message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userAPI.delete(deletingUser.id);
      toast.success('User berhasil dihapus');
      loadUsers();
      setShowDeleteConfirm(false);
      setDeletingUser(null);
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal hapus user';
      toast.error(message);
    }
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const openDeleteUser = (user) => {
    setDeletingUser(user);
    setShowDeleteConfirm(true);
  };

  const closeUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const getDeleteDisabledReason = (user) => {
    // Cannot delete self
    if (user.id === currentUser.id) {
      return 'Anda tidak dapat menghapus akun sendiri';
    }
    // Cannot delete last admin
    if (user.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        return 'Tidak dapat menghapus admin terakhir';
      }
    }
    return null;
  };

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">👥 User Management</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola user dan hak akses</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowUserForm(true);
          }}
          className="btn-primary"
        >
          <span>➕</span> Buat User Baru
        </button>
      </div>

      {/* User List */}
      <UserList
        users={users}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onEdit={openEditUser}
        onDelete={openDeleteUser}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onClose={closeUserForm}
          onOpenChangePassword={() => setShowChangePassword(true)}
        />
      )}

      {/* Change Password Modal */}
      {showChangePassword && editingUser && (
        <ChangePasswordForm
          user={editingUser}
          onSubmit={handleChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingUser && (
        <DeleteConfirmation
          user={deletingUser}
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingUser(null);
          }}
          disabledReason={getDeleteDisabledReason(deletingUser)}
        />
      )}
    </div>
  );
}
