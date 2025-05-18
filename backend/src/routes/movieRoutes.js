const express = require('express');
const router = express.Router();
// --- COMENTARIOS PARA TI ---
// const movieController = require('../controllers/movieController');
// const authMiddleware = require('../middlewares/authMiddleware'); // Si quieres proteger rutas

// router.get('/', movieController.getAllMovies);
// router.post('/', authMiddleware, movieController.createMovie); // Ejemplo con autenticación
// router.get('/:id', movieController.getMovieById);
// router.put('/:id', authMiddleware, movieController.updateMovie);
// router.delete('/:id', authMiddleware, movieController.deleteMovie);

// Por ahora, una ruta de ejemplo:
router.get('/', (req, res) => {
    res.json({ message: "Listar todas las películas (TODO)" });
});

router.post('/', (req, res) => {
    const movieData = req.body;
    // Validar movieData (quizás con Zod)
    console.log("Datos de película recibidos:", movieData);
    res.status(201).json({ message: "Película creada (TODO)", data: movieData });
});
// --------------------------

module.exports = router; 