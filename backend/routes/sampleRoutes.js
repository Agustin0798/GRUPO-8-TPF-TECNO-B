/**
*    Project     : Sample Vault
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Marzo 2026
*/

const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sampleController');

//configuración de Multer para subir archivos de audio:
const { uploadMiddleware } = require('../config/multerConfig');

const { verifyToken } = require('../middleware/authMiddleware');

// Todas las rutas de samples requieren que el usuario esté logueado
router.use(verifyToken);

// Subir un nuevo audio: POST /api/samples/upload
// 'audioFile' es el nombre que debe tener el campo file en el FormData del frontend
router.post(
    '/upload',
    /****
    Middleware de Multer para manejar la subida del archivo, con manejo de errores específico para archivos grandes o formatos inválidos
    El middleware de Multer se ejecuta antes del controlador, y maneja la subida del archivo. Si hay un error (como formato inválido o archivo demasiado grande), responde con el error adecuado sin llegar al controlador.
    El estandar HTTP CORRECTO SERIA DEVOLVER UN 413
    Multer estaba devolviendo 500
    ****/
   (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err && err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ message: "El archivo supera el límite de tamaño permitido." });
            }
            if (err) return res.status(400).json({ message: err.message });
            next();
        });
    },
    sampleController.uploadSample
);

// Listar mis samples: GET /api/samples/my-samples
router.get('/my-samples', verifyToken, sampleController.getMySamples);

// Eliminar un sample: DELETE /api/samples/:id
router.delete('/:id', sampleController.deleteSample);

module.exports = router;