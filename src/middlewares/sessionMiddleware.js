const session = require('express-session');

const sessionMiddleware = session({
    name: 'sessionId', 
    secret: process.env.SESSION_SECRET || 'secreto_super_seguro',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax', 
        maxAge: 1000 * 60 * 30, // 30 minutos
        path: '/' 
    },
});

module.exports = sessionMiddleware;