require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const csrf = require('csurf');
const db = require('./db');
const appRoutes = require('./routes/appRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

const sessionStore = new mysqlStore(
  {
    expiration: 1000 * 60 * 60 * 8,
    createDatabaseTable: true,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data',
      },
    },
  },
  db
);

const csrfProtection = csrf({
  cookie: false,
});

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  })
);

app.use(express.json());

app.use(
  session({
    key: 'inventory.sid',
    secret: process.env.SESSION_SECRET || 'inventory_session_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.get('/auth/csrf-token', csrfProtection, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/activity-logs', activityRoutes);
app.use('/app', appRoutes);

async function startServer() {
  try {
    await db.getConnection();
    console.log('Connected to MySQL!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();
