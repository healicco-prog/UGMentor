import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add User State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('User@123');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('student');

  useEffect(() => {
    fetchUsers();
  }, []);

  const getAuthToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      toast.error('Failed to fetch users: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.full_name?.toLowerCase().includes(search.toLowerCase()) || false) || 
      (u.email?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (u.role?.toLowerCase().includes(search.toLowerCase()) || false)
    );
  }, [users, search]);

  const handleResetPassword = async (id: string, email: string) => {
    const loadingToast = toast.loading(`Resetting password for ${email}...`);
    
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/api/admin/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, email, password: 'User@123' })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset password');
      }

      toast.success(`Password reset to "User@123" for ${email}`, { id: loadingToast });
      fetchUsers(); // Refresh to show the updated password
    } catch (err: any) {
      toast.error('Failed to reset password: ' + err.message, { id: loadingToast });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(`Adding user ${newEmail}...`);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail, password: newPassword, full_name: newFullName, role: newRole })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add user');
      }

      toast.success(`User ${newEmail} added successfully!`, { id: loadingToast });
      setIsAddModalOpen(false);
      setNewEmail('');
      setNewFullName('');
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to add user: ' + err.message, { id: loadingToast });
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${email}? This action cannot be undone.`)) return;
    
    const loadingToast = toast.loading(`Deleting ${email}...`);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      toast.success(`User ${email} deleted successfully!`, { id: loadingToast });
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to delete user: ' + err.message, { id: loadingToast });
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', color: '#0f172a' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>User Management</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px 0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              👥
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>All Platform Users</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{isLoading ? 'Loading...' : `${users.length} total users`}</div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search name, email, role..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ padding: '10px 16px 10px 36px', borderRadius: 8, border: '1px solid #e2e8f0', width: 220, outline: 'none', color: '#0f172a' }} 
                />
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>+</span> Add User
              </button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>NAME</th>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>EMAIL</th>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>ROLE</th>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>JOINED</th>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>🔑 PASSWORD</th>
                <th style={{ padding: '16px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading users...</td>
                </tr>
              ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 700, fontSize: 14 }}>{user.full_name || 'N/A'}</td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: 14 }}>{user.email}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800 }}>{user.role}</span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: 13 }}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: '16px', color: '#0f172a', fontSize: 14, fontWeight: 600 }}>
                    {user.password || <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: 12, fontWeight: 'normal' }}>Not set</span>}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleResetPassword(user.id, user.email)}
                        style={{ border: '1px solid #e0e7ff', background: '#f5f3ff', color: '#7c3aed', padding: '6px 12px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>🔗</span> Reset
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        style={{ border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No users found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 400 }}>
            <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Full Name</label>
                <input required type="text" value={newFullName} onChange={e => setNewFullName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }} placeholder="Dr. John Doe" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Email Address</label>
                <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }} placeholder="john@example.com" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <option value="student">Student</option>
                  <option value="master_admin">Master Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Initial Password</label>
                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '10px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
