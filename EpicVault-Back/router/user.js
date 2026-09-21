const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 1. GET: Listar todos
router.get('/', async (req, res) => {
    try {
        const arrayUsuariosDB = await User.find();
        res.json(arrayUsuariosDB);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error recuperando los usuarios' });
    }
});

// 2. POST: Crear usuario (Desde el panel de Admin, sin foto por ahora)
router.post('/', async (req, res) => {
    const body = req.body;
    try {
        const usuarioDB = new User(body);
        usuarioDB.created_at = new Date();

        await usuarioDB.save();
        res.json({ estado: true, mensaje: 'Usuario creado', data: usuarioDB });
    } catch (error) {
        console.log(error);
        res.status(500).json({ estado: false, mensaje: 'Error al crear usuario' });
    }
});

// 3. GET ONE: Ver un usuario específico (Para editar)
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const usuarioDB = await User.findOne({ _id: id });
        res.json(usuarioDB);
    } catch (error) {
        console.log(error);
        res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
});

// 4. DELETE: Eliminar
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const usuarioDB = await User.findByIdAndDelete({ _id: id });
        if (!usuarioDB) {
            res.json({ estado: false, mensaje: 'No se puede eliminar el Usuario.' });
        } else {
            res.json({ estado: true, mensaje: 'Usuario eliminado.' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ estado: false, mensaje: 'Error al eliminar.' });
    }
});

// 5. PUT: Editar (¡AHORA CON SOPORTE PARA IMAGEN!)
router.put('/:id', upload.single('avatar_image'), async (req, res) => {
    const id = req.params.id;
    const body = req.body;

    try {
        if (req.file) {
            body.avatar_url = `http://localhost:4000/uploads/${req.file.filename}`;
        }

        const usuarioActualizado = await User.findByIdAndUpdate(id, body, { new: true });

        if (!usuarioActualizado) {
            return res.status(404).json({ estado: false, mensaje: 'Usuario no encontrado' });
        }

        res.json({
            estado: true,
            mensaje: 'Usuario editado correctamente',
            user: usuarioActualizado
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ estado: false, mensaje: 'Problema al editar el Usuario' });
    }
});

module.exports = router;