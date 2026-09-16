# Inventory Management System

React/Vite frontend with an Express/MySQL backend, server-side session authentication, and role-based access control.

## Default development accounts

The backend seed script creates these accounts only when the usernames do not already exist:

| Username | Role | Temporary password | Status |
| --- | --- | --- | --- |
| `admin` | Administrator | `1234` | Active |
| `staff` | Staff | `1234` | Active |

Passwords are stored in MySQL as bcrypt hashes. These credentials are for local development only. Change them after the first login using the Change Password page.

To create any missing default account, run:

```powershell
cd backend
npm run seed:users
```

The seed script never overwrites an existing password and never creates duplicate usernames. If a password is changed in the database, the current password cannot be recovered from the bcrypt hash; update this table manually only if you intentionally establish a new documented development credential.

## Local setup

1. Create `backend/.env` from `backend/.env.example`.
2. Set the MySQL connection values and a private `SESSION_SECRET`.
3. Install dependencies and seed the development accounts:

```powershell
cd backend
npm install
npm run seed:users
npm start
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The default frontend URL is `http://localhost:5173`, and the backend listens on port `5000`.

## Roles

- **Admin:** dashboard, product and stock management, sales history, user management, and activity logs.
- **Staff:** product browsing/search, cart checkout, and personal password changes.

Authorization is enforced by the backend. Frontend navigation visibility is not used as a security boundary.
