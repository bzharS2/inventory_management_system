import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import './Navbar.css';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const links = isAdmin
    ? [
        { to: '/', label: 'Dashboard' },
        { to: '/products', label: 'Products' },
        { to: '/sales', label: 'Sales' },
        { to: '/lowStocks', label: 'Low Stocks' },
        { to: '/popular', label: 'Popular' },
        { to: '/cart', label: 'Cart' },
        { to: '/users', label: 'Users' },
        { to: '/activity-logs', label: 'Activity Logs' },
        { to: '/change-password', label: 'Change Password' },
      ]
    : [
        { to: '/products', label: 'Products' },
        { to: '/lowStocks', label: 'Low Stocks' },
        { to: '/cart', label: 'Cart' },
        { to: '/change-password', label: 'Change Password' },
      ];

  async function handleLogout() {
    setConfirmLogout(false);
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="admin-nav">
      <div className="admin-nav__brand">
        <span className="admin-nav__brand-mark">◆</span>
        <span className="admin-nav__brand-name">Stockroom</span>
      </div>

      <div className="admin-nav__links">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'admin-nav__link' + (isActive ? ' admin-nav__link--active' : '')
            }
          >
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="admin-nav__link admin-nav__link--button"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      <button
        className="admin-nav__toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span className="admin-nav__toggle-line" />
        <span className="admin-nav__toggle-line" />
        <span className="admin-nav__toggle-line" />
      </button>

      {menuOpen && (
        <div className="admin-nav__dropdown">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                'admin-nav__dropdown-link' +
                (isActive ? ' admin-nav__dropdown-link--active' : '')
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setConfirmLogout(true);
            }}
            className="admin-nav__dropdown-link"
            style={{ background: 'none', border: 'none', textAlign: 'left' }}
          >
            Logout
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </nav>
  );
}
