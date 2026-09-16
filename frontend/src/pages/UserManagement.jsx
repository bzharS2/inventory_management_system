import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import ConfirmDialog from '../components/ConfirmDialog';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  async function loadUsers() {
    const response = await fetch('http://localhost:5000/users', { credentials: 'include' });
    const data = await response.json();
    if (response.ok) {
      setUsers(data);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function createUser(event) {
    event.preventDefault();
    setPendingUser({ username, password, role });
  }

  async function confirmCreateUser() {
    const userToCreate = pendingUser;
    setPendingUser(null);
    const csrfResponse = await fetch('http://localhost:5000/auth/csrf-token', { credentials: 'include' });
    const csrfData = await csrfResponse.json().catch(() => ({}));
    const response = await fetch('http://localhost:5000/users', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfData.csrfToken ? { 'X-CSRF-Token': csrfData.csrfToken } : {}),
      },
      body: JSON.stringify(userToCreate),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Unable to create user');
      return;
    }

    setMessage('User created successfully');
    setUsername('');
    setPassword('');
    setRole('staff');
    setShowForm(false);
    loadUsers();
  }

  async function toggleStatus(userId, isActive) {
    const csrfResponse = await fetch('http://localhost:5000/auth/csrf-token', { credentials: 'include' });
    const csrfData = await csrfResponse.json().catch(() => ({}));
    const response = await fetch(`http://localhost:5000/users/${userId}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfData.csrfToken ? { 'X-CSRF-Token': csrfData.csrfToken } : {}),
      },
      body: JSON.stringify({ status: isActive ? 'inactive' : 'active' }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Unable to update status');
      return;
    }

    setMessage('User status updated');
    loadUsers();
  }

  return (
    <div>
      <NavBar />
      <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>User Management</h2>
        <button type="button" onClick={() => setShowForm(true)} style={{ padding: '0.8rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8 }}>
          Add User
        </button>
      </div>
      {message && <div style={{ marginBottom: '1rem', background: '#ecfdf5', color: '#027a48', padding: 10, borderRadius: 8 }}>{message}</div>}

      {showForm && <form onSubmit={createUser} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 12, marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: 500 }}>
          <div>
            <label htmlFor="username">Username</label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c7ced8' }} />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c7ced8' }} />
          </div>
          <div>
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c7ced8' }}>
              <option value="staff">staff</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" style={{ padding: '0.8rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8 }}>
              Create {role === 'admin' ? 'Admin' : 'Staff'} User
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.8rem', background: '#e2e8f0', border: 'none', borderRadius: 8 }}>Cancel</button>
          </div>
        </div>
      </form>}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {users.map((user) => (
          <div key={user.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{user.username}</strong>
                <div style={{ color: '#475467' }}>{user.role} • {user.is_active ? 'Active' : 'Inactive'}</div>
              </div>
              <button onClick={() => toggleStatus(user.id, user.is_active)} style={{ background: user.is_active ? '#dc2626' : '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 0.8rem' }}>
                {user.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
            </div>
        ))}
      </div>
      <ConfirmDialog
        open={pendingUser !== null}
        title="Create user?"
        message={`Are you sure you want to create this ${pendingUser?.role || ''} account?`}
        confirmLabel={`Create ${pendingUser?.role === 'admin' ? 'Admin' : 'Staff'} User`}
        onConfirm={confirmCreateUser}
        onCancel={() => setPendingUser(null)}
      />
    </div>
    </div>
  );
}

export default UserManagement;
