// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sessionMiddleware = require('./middlewares/sessionMiddleware'); // Asegúrate que este archivo exista
const userRoutes = require('./routes/userRoutes');
const pool = require('./db/conexion.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://127.0.0.1:5500', // Cambia según tu frontend
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware); 

// Logs para ver el middleware de logging
app.use((req, res, next) => {
    console.log('══════════════════════════');
    console.log('Nueva petición:', req.method, req.path);
    console.log('Session ID:', req.sessionID);
    console.log('══════════════════════════');
    next();
});

// Rutas
app.use('/api/users', userRoutes);

// Función de test de conexión a BD
async function testConnection() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('Conexión a la base de datos establecida. Resultado:', rows[0].result);
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error.message);
    }
}

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    await testConnection();
});