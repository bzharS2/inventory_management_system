import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import ConfirmDialog from '../components/ConfirmDialog';
import { changePassword } from '../services/api';

export default function ChangePassword() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmChange, setConfirmChange] = useState(false);

  async function handleChangePassword() {
    setConfirmChange(false);
    setLoading(true);
    try {
      const data = await changePassword(currentPassword, newPassword);
      if (data.error) {
        throw new Error(data.error);
      }

      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setConfirmChange(true);
  }

  return (
    <div>
      <NavBar />
      <div style={{ maxWidth: 520, margin: '2rem auto', padding: '2rem', borderRadius: 12, background: '#f8fafc' }}>
      <h2 style={{ marginBottom: '1rem' }}>Change Password</h2>
      <p style={{ marginBottom: '1.5rem' }}>Signed in as {user?.username}</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: 8 }}>Current Password</label>
          <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c7ced8' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="newPassword" style={{ display: 'block', marginBottom: 8 }}>New Password</label>
          <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c7ced8' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: 8 }}>Confirm New Password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c7ced8' }} />
        </div>

        {error && <div style={{ marginBottom: '1rem', color: '#b42318', background: '#fef3f2', padding: 10, borderRadius: 8 }}>{error}</div>}
        {success && <div style={{ marginBottom: '1rem', color: '#027a48', background: '#ecfdf5', padding: 10, borderRadius: 8 }}>{success}</div>}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.9rem', border: 'none', borderRadius: 8, background: '#0f766e', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving...' : 'Change Password'}
        </button>
      </form>
      </div>
      <ConfirmDialog
        open={confirmChange}
        title="Change password?"
        message="Are you sure you want to update your password?"
        confirmLabel="Change Password"
        onConfirm={handleChangePassword}
        onCancel={() => setConfirmChange(false)}
      />
    </div>
  );
}
