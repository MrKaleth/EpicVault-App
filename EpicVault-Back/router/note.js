const express = require('express');
const router = express.Router();
const Note = require('../models/note');

// 1. CREAR NOTA
router.post('/', async (req, res) => {
    try {
        const newNote = new Note(req.body);
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear la nota', error });
    }
});

// 2. OBTENER NOTAS DE UNA CAMPAÑA
router.get('/campaign/:campaignId', async (req, res) => {
    try {
        const notes = await Note.find({ campaign_id: req.params.campaignId })
            .populate('author_id', 'username avatar_url')
            .sort({ createdAt: -1 }); // Las más nuevas primero
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las notas', error });
    }
});

// 3. BORRAR NOTA
router.delete('/:id', async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) return res.status(404).json({ message: 'Nota no encontrada' });
        res.json({ message: 'Nota eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la nota', error });
    }
});

// 4. EDITAR NOTA
router.patch('/:id', async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true } 
        );
        if (!updatedNote) return res.status(404).json({ message: 'Nota no encontrada' });
        res.json(updatedNote);
    } catch (error) {
        res.status(400).json({ message: 'Error al editar la nota', error });
    }
});

module.exports = router;