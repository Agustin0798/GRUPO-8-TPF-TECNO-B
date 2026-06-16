/**
*    Project     : Sample Vault
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Marzo 2026
*/

/**
 * Importación del módulo multer
 * Multer es un middleware de Node.js diseñado para Express, 
 * esencial para manejar la carga de archivos (imágenes, documentos, etc.)
 * enviados en formato multipart/form-data. Simplifica la gestión 
 * de archivos al permitir configuraciones de almacenamiento en disco 
 * o memoria, filtrado de tipos y límites de tamaño, añadiendo un objeto
 * file o files al objeto request.
 */

const multer = require('multer');
const path = require('path');


//Firmas de bytes (magic bytes) de los formatos de audio soportados.
const AUDIO_SIGNATURES = [
    { bytes: [0x52, 0x49, 0x46, 0x46], label: 'WAV'        },
    { bytes: [0x49, 0x44, 0x33],       label: 'MP3 (ID3)'  },
    { bytes: [0xFF, 0xFB],             label: 'MP3'        },
    { bytes: [0xFF, 0xF3],             label: 'MP3'        },
    { bytes: [0xFF, 0xF2],             label: 'MP3'        },
    { bytes: [0x4F, 0x67, 0x67, 0x53], label: 'OGG'       },
    { bytes: [0x66, 0x4C, 0x61, 0x43], label: 'FLAC'      },
];

/**
 * Verifica si el buffer de un archivo comienza con alguna
 * de las firmas de audio conocidas.
 */
function hasValidAudioSignature(buffer) {
    return AUDIO_SIGNATURES.some(sig =>
        sig.bytes.every((byte, index) => buffer[index] === byte)
    );
}

// Extensiones y MIME types permitidos
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac'];
const ALLOWED_MIME_TYPES  = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/flac'];

/**
 * memoryStorage mantiene el archivo en RAM (req.file.buffer)
 * para que podamos leer los magic bytes antes de persistirlo en disco.
 */
const storage = multer.memoryStorage();


/**
 * Primer filtro: valida extensión y MIME type declarados por el cliente.
 * La validación de magic bytes (contenido real) ocurre en el controller.
 */
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        const error = new Error('El archivo no es un audio válido');
        error.status = 415;
        return cb(error, false);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        const error = new Error('El archivo no es un audio válido');
        error.status = 415;
        return cb(error, false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB por archivo
 });

// 'audioFile' es el nombre del campo en el formulario
module.exports = {
    uploadMiddleware: upload.single('audioFile'),
    hasValidAudioSignature,
};