const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

// Cargar variables de entorno desde backend/.env
// dotenv.config(); // No es necesario si server.js lo hace o si se carga globalmente

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Puerto común de Vite para Vue es 5173
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(express.json()); // Para parsear JSON en el body de las peticiones POST/PUT

// Rutas base (Placeholder)
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de MyMediaVerse!" });
});

// --- COMENTARIOS PARA TI ---
// Aquí es donde importarías y usarías tus archivos de rutas.
// Ejemplo:
// const movieRoutes = require('./routes/movieRoutes');
// const serieRoutes = require('./routes/serieRoutes');
// const animeRoutes = require('./routes/animeRoutes');
// const authRoutes = require('./routes/authRoutes'); // Para login/registro

// app.use('/api/movies', movieRoutes);
// app.use('/api/series', serieRoutes);
// app.use('/api/animes', animeRoutes);
// app.use('/api/auth', authRoutes);
// --------------------------

// Placeholder para una ruta de productos (la que tenías)
// Deberías mover esto a su propio archivo de rutas y controlador.
const { getConnection } = require("./config/database"); // Ruta actualizada

app.get("/api/productos", async (req, res) => { // Añadido /api para diferenciar de rutas frontend
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.query("SELECT * FROM productos");
    res.json(result);
  } catch (error) {
    console.error("Error en la ruta /api/productos:", error.message);
    res.status(500).json({ message: "Error al obtener productos", error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error("Error closing db connection:", err.message);
      }
    }
  }
});


// --- COMENTARIOS PARA TI ---
// Manejo de errores global (opcional pero recomendado)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('¡Algo salió mal!');
// });
// --------------------------

module.exports = app; 