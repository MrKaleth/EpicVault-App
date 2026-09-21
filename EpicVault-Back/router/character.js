const express = require('express');
const router = express.Router();
const Character = require('../models/character');

// 1. CREAR PERSONAJE
router.post('/', async (req, res) => {
    try {
        const newCharacter = new Character(req.body);
        const savedCharacter = await newCharacter.save();
        res.status(201).json(savedCharacter);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el personaje', error });
    }
});

// 2. OBTENER PERSONAJES DE UNA CAMPAÑA
router.get('/campaign/:campaignId', async (req, res) => {
    try {
        const characters = await Character.find({ campaign_id: req.params.campaignId })
            .populate('user_id', 'username avatar_url');
        res.json(characters);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los personajes', error });
    }
});

// 3. ACTUALIZAR DINERO (Público y Privado)
router.patch('/:id/money', async (req, res) => {
    try {
        const character = await Character.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    public_money: req.body.public_money,
                    private_money: req.body.private_money
                }
            },
            { new: true }
        );
        if (!character) return res.status(404).json({ message: 'Personaje no encontrado' });
        res.json(character);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar los monederos', error });
    }
});

// 4. AÑADIR OBJETO AL INVENTARIO
router.post('/:id/inventory', async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) return res.status(404).json({ message: 'Personaje no encontrado' });

        character.inventory.push(req.body);
        await character.save();
        res.json(character);
    } catch (error) {
        res.status(400).json({ message: 'Error al añadir objeto al inventario', error });
    }
});

// 5. BORRAR OBJETO DEL INVENTARIO
router.delete('/:id/inventory/:itemId', async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) return res.status(404).json({ message: 'Personaje no encontrado' });

        character.inventory.id(req.params.itemId).deleteOne();
        await character.save();
        res.json(character);
    } catch (error) {
        res.status(400).json({ message: 'Error al eliminar objeto', error });
    }
});

// 6. EDITAR DATOS PRINCIPALES DEL PERSONAJE (Nivel, Clase, etc.)
router.patch('/:id', async (req, res) => {
    try {
        const character = await Character.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!character) return res.status(404).json({ message: 'Personaje no encontrado' });
        res.json(character);
    } catch (error) {
        res.status(400).json({ message: 'Error al editar el personaje', error });
    }
});

// 7. EDITAR OBJETO DEL INVENTARIO (Cantidad, Descripción, Equipado...)
router.patch('/:id/inventory/:itemId', async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) return res.status(404).json({ message: 'Personaje no encontrado' });

        const item = character.inventory.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Objeto no encontrado' });

        if (req.body.name !== undefined) item.name = req.body.name;
        if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
        if (req.body.description !== undefined) item.description = req.body.description;
        if (req.body.isEquipped !== undefined) item.isEquipped = req.body.isEquipped;
        if (req.body.isPublic !== undefined) item.isPublic = req.body.isPublic;

        await character.save();
        res.json(character);
    } catch (error) {
        res.status(400).json({ message: 'Error al editar el objeto', error });
    }
});

// 8. BORRAR PERSONAJE COMPLETO
router.delete('/:id', async (req, res) => {
    try {
        const deletedCharacter = await Character.findByIdAndDelete(req.params.id);
        if (!deletedCharacter) return res.status(404).json({ message: 'Personaje no encontrado' });
        res.json({ message: 'Personaje eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el personaje', error });
    }
});

module.exports = router;