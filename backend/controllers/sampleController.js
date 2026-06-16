/**
* Project     : Sample Vault
* Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
* License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
* Date        : Marzo 2026
*/

const fs   = require('fs');
const path = require('path');

const fileHelper = require('../utils/fileHelper');
const sampleRepo = require('../repositories/sampleRepo');
const { hasValidAudioSignature } = require('../config/multerConfig');

class SampleController 
{
    // Método para subir un sample y guardarlo en la BD
    async uploadSample(req, res) 
    {
        try
        {
            // 1. Verificar que multer dejó pasar el archivo
            if (!req.file)
            {
                return res.status(400).json({ message: "No se subió ningún archivo o el formato es inválido." });
            }

            // 2. Validar magic bytes: verificar que el contenido real sea audio
            //    Esto detecta el caso donde la extensión es .wav pero el
            //    contenido es texto, ejecutable u otro formato no-audio.
            if (!hasValidAudioSignature(req.file.buffer))
            {
                return res.status(415).json({ message: "El archivo no es un audio válido" });
            }

            // 3. Validar datos obligatorios del formulario
            const { display_name, category, bpm } = req.body;
            if (!display_name || !category)
            {
                return res.status(400).json({ message: "El nombre y la categoría son obligatorios." });
            }

            // 4. Construir nombre único y guardar el archivo en disco
            //    (antes lo hacía diskStorage automáticamente)
            const uniqueFilename = Date.now() + '-' + req.file.originalname;
            const uploadDir  = path.join(process.cwd(), 'uploads');
            const absPath    = path.join(uploadDir, uniqueFilename);

            fs.writeFileSync(absPath, req.file.buffer);

            const filePath = `/uploads/${uniqueFilename}`;
            const userId   = req.userId; // Proveniente del verifyToken

            // 5. Persistencia mediante el SP sp_create_sample
            const insertId = await sampleRepo.create({
                user_id:      userId,
                filename:     uniqueFilename,
                display_name,
                category,
                bpm:          parseInt(bpm) || 0,
                file_path:    filePath
            });

            res.status(201).json({ 
                message: "Sample cargado exitosamente en la biblioteca.", 
                id:      insertId,
                path:    filePath 
            });
        }
        catch (error)
        {
            res.status(500).json({ message: "Error durante la carga del sample.", error: error.message });
        }
    }

    // Listar samples del productor logueado
    async getMySamples(req, res)
    {
        try
        {
            // El SP sp_find_samples_by_user filtra automáticamente por user_id
            const samples = await sampleRepo.findByUserId(req.userId);
            res.json(samples);
        }
        catch (error)
        {
            res.status(500).json({ message: "Error al recuperar la biblioteca.", error: error.message });
        }
    }

    // Eliminar un sample de la biblioteca
    async deleteSample(req, res) 
    {
        try 
        {
            const { id } = req.params;
            const userId = req.userId;

            // 1. Obtener metadatos para conocer la ruta del archivo físico
            const sample = await sampleRepo.findById(id, userId);
            
            if (!sample) {
                return res.status(404).json({ message: "El sample no existe o no tienes permisos para eliminarlo." });
            }

            // 2. Ejecutar sp_delete_sample en la base de datos
            await sampleRepo.delete(id, userId);

            // 3. Eliminación física del archivo (Gestión de recursos)
            fileHelper.deleteFile(sample.file_path); 
            
            return res.json({ message: "Registro eliminado y archivo físico removido con éxito." });
        }
        catch (error)
        {
            res.status(500).json({ message: "Error al eliminar el sample.", error: error.message });
        }
    }
}

module.exports = new SampleController();
