import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/products", label: "Products" },
    { to: "/sales", label: "Sales" },
    { to: "/lowStocks", label: "Low Stocks" },
    { to: "/popular", label: "Popular" },
    { to: "/cart", label: "Cart" },
  ];

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
              "admin-nav__link" + (isActive ? " admin-nav__link--active" : "")
            }
          >
            {label}
          </NavLink>
        ))}
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
                "admin-nav__dropdown-link" +
                (isActive ? " admin-nav__dropdown-link--active" : "")
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
