import React, { useState, useEffect } from 'react';
import { 
  X, Search, ArrowUpDown, ChevronDown, Shield, UserCheck, 
  UserX, Trash2, Clock, Activity, CheckSquare, Square, 
  ExternalLink, Edit3, Eye, AlertCircle, CheckCircle2, 
  RefreshCw, Filter, Sparkles, Key, Lock, Mail
} from 'lucide-react';
import { useAuth, DbUser } from '../context/AuthContext';

interface UserDetail extends DbUser {
  activityLogs?: Array<{
    id: number;
    action: string;
    details?: string;
    ipAddress?: string;
    createdAt: string;
  }>;
}

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onOpenAuthForAdmin: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onOpenAuthForAdmin
}) => {
  const { currentUser, dbUser, isAdmin, isViewer } = useAuth();

  const [users, setUsers] = useState<DbUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'status' | 'createdAt' | 'lastLogin'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection & Bulk Actions
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Detail View Drawer
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [editRole, setEditRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended' | 'deleted'>('active');
  const [editTier, setEditTier] = useState<'Free' | 'Pro' | 'Enterprise'>('Pro');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch users from PostgreSQL
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, searchQuery, roleFilter, statusFilter, sortBy, sortOrder]);

  if (!isOpen) return null;

  // View User Full Profile & Activity Log
  const handleOpenDetail = async (user: DbUser) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUserDetail(data.user);
        setEditRole(data.user.role);
        setEditStatus(data.user.status);
        setEditTier(data.user.subscriptionTier);
      } else {
        setSelectedUserDetail(user);
      }
    } catch (err) {
      setSelectedUserDetail(user);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Save changes to user
  const handleSaveUser = async () => {
    if (!selectedUserDetail) return;
    if (!isAdmin) {
      setNotification({ type: 'error', message: 'Permission Denied: Only administrators can edit user accounts.' });
      return;
    }

    setIsSavingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUserDetail.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          status: editStatus,
          subscriptionTier: editTier,
        })
      });

      if (res.ok) {
        const data = await res.json();
        setNotification({ type: 'success', message: `User ${selectedUserDetail.name} updated successfully.` });
        setSelectedUserDetail(prev => prev ? { ...prev, ...data.user } : null);
        fetchUsers();
      } else {
        throw new Error('Failed to update user.');
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Update failed.' });
    } finally {
      setIsSavingUser(false);
    }
  };

  // Bulk Actions: activate / suspend / delete
  const handleBulkAction = async (action: 'active' | 'suspended' | 'deleted') => {
    if (!selectedUserIds.length) return;
    if (!isAdmin) {
      setNotification({ type: 'error', message: 'Permission Denied: Only administrators can perform bulk actions.' });
      return;
    }

    setIsBulkProcessing(true);
    try {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedUserIds,
          status: action,
        })
      });

      if (res.ok) {
        setNotification({ type: 'success', message: `Successfully set ${selectedUserIds.length} users to "${action}".` });
        setSelectedUserIds([]);
        fetchUsers();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Bulk action failed.' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: number) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Distinct Admin separation gate
  const userEmail = currentUser?.email || dbUser?.email || '';
  const isDesignatedAdmin = userEmail.toLowerCase() === 'sobratdayal2008@gmail.com' || isAdmin;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className={`w-full max-w-6xl h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl animate-fade-in ${
        isDark ? 'bg-[#18191A] border-[#28292A] text-white' : 'bg-white border-[#E8EAED] text-[#1F1F1F]'
      }`}>
        {/* Top Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#28292A] bg-[#1E1F20]' : 'border-[#E8EAED] bg-[#F8F9FA]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base">SaaS User Management Admin Console</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Cloud SQL PostgreSQL
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Connected to table <code className="font-mono text-amber-400">users</code> & <code className="font-mono text-amber-400">activity_logs</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Authenticated Admin Badge */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDark ? 'bg-[#18191A] border-[#3C4043]' : 'bg-white border-[#DADCE0]'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-stone-400">Signed in as:</span>
              <span className="font-semibold font-mono text-amber-400">{userEmail || 'sobratdayal2008@gmail.com'}</span>
              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                {dbUser?.role?.toUpperCase() || 'ADMIN'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className={`px-6 py-2.5 flex items-center justify-between text-xs border-b ${
            notification.type === 'success' 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="cursor-pointer text-stone-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Permission Disclaimer if Viewer */}
        {isViewer && (
          <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span><strong>Viewer Mode Enabled:</strong> You have read-only access. You can search, sort, and inspect user profiles and activity logs, but cannot edit or execute bulk actions.</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'border-[#28292A]' : 'border-[#E8EAED]'
        }`}>
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none ${
                isDark ? 'bg-[#18191A] border-[#3C4043] text-white focus:border-amber-400' : 'bg-stone-50 border-[#DADCE0] focus:border-amber-600'
              }`}
            />
          </div>

          {/* Role & Status Filter Dropdowns */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className={`text-xs py-1.5 px-2.5 rounded-xl border outline-none cursor-pointer ${
                  isDark ? 'bg-[#18191A] border-[#3C4043] text-white' : 'bg-stone-50 border-[#DADCE0]'
                }`}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className={`text-xs py-1.5 px-2.5 rounded-xl border outline-none cursor-pointer ${
                  isDark ? 'bg-[#18191A] border-[#3C4043] text-white' : 'bg-stone-50 border-[#DADCE0]'
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>

            <button
              onClick={fetchUsers}
              title="Refresh database records"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark ? 'bg-[#18191A] border-[#3C4043] hover:text-amber-400' : 'bg-stone-50 border-[#DADCE0] hover:text-amber-600'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar (Appears when rows selected) */}
        {selectedUserIds.length > 0 && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs animate-fade-in">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <span>{selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('active')}
                disabled={isBulkProcessing || !isAdmin}
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Activate</span>
              </button>
              <button
                onClick={() => handleBulkAction('suspended')}
                disabled={isBulkProcessing || !isAdmin}
                className="px-3 py-1 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-500 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Suspend</span>
              </button>
              <button
                onClick={() => handleBulkAction('deleted')}
                disabled={isBulkProcessing || !isAdmin}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-500 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedUserIds([])}
                className="px-2 py-1 text-stone-400 hover:text-white ml-2 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className={`sticky top-0 z-10 font-semibold uppercase tracking-wider text-[10px] ${
              isDark ? 'bg-[#1E1F20] text-stone-400 border-b border-[#28292A]' : 'bg-stone-100 text-stone-600 border-b border-[#E8EAED]'
            }`}>
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button onClick={toggleSelectAll} className="cursor-pointer text-stone-400 hover:text-white">
                    {selectedUserIds.length === users.length && users.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th onClick={() => handleSort('name')} className="p-3.5 cursor-pointer hover:text-amber-400 select-none">
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('email')} className="p-3.5 cursor-pointer hover:text-amber-400 select-none">
                  <div className="flex items-center gap-1">
                    <span>Email</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('role')} className="p-3.5 cursor-pointer hover:text-amber-400 select-none">
                  <div className="flex items-center gap-1">
                    <span>Role</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} className="p-3.5 cursor-pointer hover:text-amber-400 select-none">
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5">Tier</th>
                <th onClick={() => handleSort('createdAt')} className="p-3.5 cursor-pointer hover:text-amber-400 select-none">
                  <div className="flex items-center gap-1">
                    <span>Created Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('lastLogin')} className="p-3.5 cursor-pointer hover:text-amber-400 select-none">
                  <div className="flex items-center gap-1">
                    <span>Last Login</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    <span>Loading users from Cloud SQL...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-stone-400">
                    No users matching the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <tr 
                      key={user.id}
                      className={`transition-colors duration-150 hover:bg-amber-500/5 ${
                        isSelected ? isDark ? 'bg-amber-500/10' : 'bg-amber-50' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <button onClick={() => toggleSelectUser(user.id)} className="cursor-pointer text-stone-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 font-medium">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`}
                            alt={user.name}
                            className="w-7 h-7 rounded-full bg-stone-700 object-cover flex-shrink-0"
                          />
                          <span className="font-semibold text-xs">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-stone-400 text-xs">
                        {user.email}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : user.role === 'member'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-stone-500/20 text-stone-400 border border-stone-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${
                            user.status === 'active'
                              ? 'bg-emerald-400'
                              : user.status === 'suspended'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`} />
                          <span className="capitalize font-medium text-xs">{user.status}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-xs">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                          user.subscriptionTier === 'Enterprise'
                            ? 'bg-amber-500/20 text-amber-400'
                            : user.subscriptionTier === 'Pro'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-stone-500/20 text-stone-400'
                        }`}>
                          {user.subscriptionTier}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-400 text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-3.5 text-stone-400 text-[11px]">
                        {new Date(user.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleOpenDetail(user)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* User Detail Drawer / Modal */}
        {selectedUserDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
            <div className={`w-full max-w-lg h-full border-l flex flex-col shadow-2xl animate-slide-left ${
              isDark ? 'bg-[#1E1F20] border-[#28292A] text-white' : 'bg-white border-[#DADCE0] text-[#1F1F1F]'
            }`}>
              {/* Drawer Header */}
              <div className="p-5 border-b border-inherit flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedUserDetail.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedUserDetail.email)}`}
                    alt={selectedUserDetail.name}
                    className="w-10 h-10 rounded-full border border-inherit object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-sm">{selectedUserDetail.name}</h3>
                    <p className="text-xs text-stone-400 font-mono">{selectedUserDetail.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Profile Overview Card */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#18191A] border-[#28292A]' : 'bg-stone-50 border-[#E8EAED]'
                }`}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    User Profile & Permissions
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px]">System UID</span>
                      <span className="font-mono text-xs">{selectedUserDetail.uid}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Registered On</span>
                      <span>{new Date(selectedUserDetail.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Last Session</span>
                      <span>{new Date(selectedUserDetail.lastLogin).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Database ID</span>
                      <span className="font-mono">#{selectedUserDetail.id}</span>
                    </div>
                  </div>

                  {/* Editable Fields (Role, Status, Tier) */}
                  <div className="pt-2 border-t border-inherit space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Access Role {isViewer && '(Read-Only)'}
                      </label>
                      <select
                        disabled={!isAdmin}
                        value={editRole}
                        onChange={e => setEditRole(e.target.value as any)}
                        className={`w-full text-xs p-2 rounded-xl border outline-none ${
                          isDark ? 'bg-[#1E1F20] border-[#3C4043]' : 'bg-white border-[#DADCE0]'
                        } disabled:opacity-60`}
                      >
                        <option value="member">Member (Regular Researcher)</option>
                        <option value="admin">Admin (Full SaaS Console Access)</option>
                        <option value="viewer">Viewer (Read-Only Observer)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Account Status {isViewer && '(Read-Only)'}
                      </label>
                      <select
                        disabled={!isAdmin}
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as any)}
                        className={`w-full text-xs p-2 rounded-xl border outline-none ${
                          isDark ? 'bg-[#1E1F20] border-[#3C4043]' : 'bg-white border-[#DADCE0]'
                        } disabled:opacity-60`}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="deleted">Deleted</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Subscription Tier {isViewer && '(Read-Only)'}
                      </label>
                      <select
                        disabled={!isAdmin}
                        value={editTier}
                        onChange={e => setEditTier(e.target.value as any)}
                        className={`w-full text-xs p-2 rounded-xl border outline-none ${
                          isDark ? 'bg-[#1E1F20] border-[#3C4043]' : 'bg-white border-[#DADCE0]'
                        } disabled:opacity-60`}
                      >
                        <option value="Free">Free Tier (10 papers/month)</option>
                        <option value="Pro">Pro Tier (Unlimited syntheses + Slides)</option>
                        <option value="Enterprise">Enterprise Tier (Dedicated GPU + Audio)</option>
                      </select>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={handleSaveUser}
                        disabled={isSavingUser}
                        className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
                      >
                        {isSavingUser ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Chronological Activity Log */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>Activity Log ({selectedUserDetail.activityLogs?.length || 0} events)</span>
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {isLoadingDetail ? (
                      <div className="p-6 text-center text-xs text-stone-400">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-amber-400" />
                        <span>Loading activity logs...</span>
                      </div>
                    ) : selectedUserDetail.activityLogs && selectedUserDetail.activityLogs.length > 0 ? (
                      selectedUserDetail.activityLogs.map(log => (
                        <div 
                          key={log.id}
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            isDark ? 'bg-[#18191A] border-[#28292A]' : 'bg-stone-50 border-[#E8EAED]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-amber-400 font-mono text-[11px]">{log.action}</span>
                            <span className="text-[10px] text-stone-500">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {log.details && (
                            <p className="text-stone-300 text-[11px] leading-relaxed">{log.details}</p>
                          )}
                          {log.ipAddress && (
                            <span className="text-[9px] font-mono text-stone-500 block">IP: {log.ipAddress}</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-stone-700 text-center text-xs text-stone-500">
                        No activity recorded yet for this user.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
