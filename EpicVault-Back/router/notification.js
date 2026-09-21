const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

// 1. OBTENER TODAS LAS NOTIFICACIONES DE UN USUARIO
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const notificaciones = await Notification.find({ recipient: userId })
            .sort({ created_at: -1 }) 
            .populate('sender', 'username avatar_url friend_code') 
            .populate('campaign', 'name cover_url'); 

        res.json(notificaciones);
    } catch (error) {
        console.error('Error al leer el buzón:', error);
        res.status(500).json({ message: 'Los cuervos se han perdido en la tormenta.' });
    }
});

// 2. MARCAR UNA NOTIFICACIÓN COMO LEÍDA
router.put('/:id/leida', async (req, res) => {
    try {
        const { id } = req.params;

        const notificacion = await Notification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        if (!notificacion) {
            return res.status(404).json({ message: 'Notificación no encontrada.' });
        }

        res.json({ message: 'Mensaje marcado como leído.', notificacion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el pergamino.' });
    }
});

// 3. MARCAR TODAS COMO LEÍDAS (Botón "Limpiar Buzón")
router.put('/leidas-todas/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'Todo el buzón ha sido marcado como leído.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al limpiar el buzón.' });
    }
});

// 4. ELIMINAR UNA NOTIFICACIÓN (Opcional, por si quieren borrar avisos viejos)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.json({ message: 'El mensaje ha sido arrojado al fuego.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la notificación.' });
    }
});

module.exports = router;