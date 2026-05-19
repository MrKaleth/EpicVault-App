const express = require('express');
const router = express.Router();
const Campaign = require('../models/campaign');
const User = require('../models/user');
const Notification = require('../models/notification');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 1. CREAR una nueva campaña
router.post('/', upload.single('cover_image'), async (req, res) => {
    try {
        const { name, description, dungeon_master } = req.body;

        let cover_url = 'https://images.unsplash.com/photo-1614273618169-2f22b7244de1?q=80&w=1000&auto=format&fit=crop';
        if (req.file) {
            cover_url = `http://localhost:4000/uploads/${req.file.filename}`;
        }

        const userDM = await User.findById(dungeon_master);
        if (!userDM) return res.status(404).json({ message: 'El usuario Dungeon Master no existe' });

        const nuevaCampana = new Campaign({
            name,
            description,
            dungeon_master,
            cover_url
        });

        const campanaGuardada = await nuevaCampana.save();

        userDM.campaigns.push(campanaGuardada._id);
        await userDM.save();

        res.status(201).json({ message: '¡Campaña forjada con éxito!', campaign: campanaGuardada });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Ya existe una campaña con ese nombre.' });
        res.status(500).json({ message: 'Error al crear la campaña' });
    }
});

// 2. OBTENER todas las campañas de un usuario
router.get('/usuario/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const campañas = await Campaign.find({
            $or: [{ dungeon_master: userId }, { players: userId }]
        }).populate('dungeon_master', 'username avatar_url');

        res.json(campañas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al recuperar las crónicas (campañas)' });
    }
});

// 3. OBTENER UNA campaña por su ID (Modificado para traer salas de espera)
router.get('/:id', async (req, res) => {
    try {
        const campana = await Campaign.findById(req.params.id)
            .populate('dungeon_master', 'username avatar_url')
            .populate('players', 'username avatar_url')
            .populate('pending_invites', 'username avatar_url') 
            .populate('pending_requests', 'username avatar_url'); 

        if (!campana) return res.status(404).json({ message: 'Campaña no encontrada' });
        res.json(campana);
    } catch (error) {
        res.status(500).json({ message: 'Error al recuperar la campaña' });
    }
});

// 4. ACTUALIZAR una campaña
router.put('/:id', upload.single('cover_image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        let datosAActualizar = { name, description };

        if (req.file) {
            datosAActualizar.cover_url = `http://localhost:4000/uploads/${req.file.filename}`;
        }

        const campanaActualizada = await Campaign.findByIdAndUpdate(
            req.params.id,
            datosAActualizar,
            { new: true }
        );

        if (!campanaActualizada) return res.status(404).json({ message: 'Campaña no encontrada' });
        res.json(campanaActualizada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar la campaña' });
    }
});

// 5. ELIMINAR una campaña
router.delete('/:id', async (req, res) => {
    try {
        const campanaBorrada = await Campaign.findByIdAndDelete(req.params.id);
        if (!campanaBorrada) return res.status(404).json({ message: 'Campaña no encontrada' });
        // (Futuro: limpiar arrays de usuarios)
        res.json({ message: 'Campaña eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la campaña' });
    }
});

// A. INVITAR AMIGO DIRECTAMENTE (Entra al instante)
router.post('/:id/invite-direct', async (req, res) => {
    try {
        const { dmId, friendId } = req.body;
        const campana = await Campaign.findById(req.params.id);
        const amigo = await User.findById(friendId);
        const dm = await User.findById(dmId);

        if (!campana || !amigo) return res.status(404).json({ message: 'Datos no encontrados' });
        if (campana.players.includes(friendId)) return res.status(400).json({ message: 'Ya está en la campaña' });

        campana.players.push(friendId);
        amigo.campaigns.push(campana._id);

        await campana.save();
        await amigo.save();

        await Notification.create({
            recipient: friendId,
            sender: dmId,
            campaign: campana._id,
            type: 'AUTO_JOIN',
            message: `${dm.username} te ha invocado directamente a la campaña "${campana.name}".`
        });

        res.json({ message: 'Amigo invocado con éxito.', campaign: campana });
    } catch (error) {
        res.status(500).json({ message: 'Error en la invocación directa.' });
    }
});

// B. INVITAR A UN AVENTURERO (Buscador - Requiere Aceptar)
router.post('/:id/invite', async (req, res) => {
    try {
        const { dmId, userId } = req.body;
        const campana = await Campaign.findById(req.params.id);
        const dm = await User.findById(dmId);

        if (campana.players.includes(userId) || campana.pending_invites.includes(userId)) {
            return res.status(400).json({ message: 'Ya ha sido invitado o ya está dentro.' });
        }

        campana.pending_invites.push(userId);
        await campana.save();

        await Notification.create({
            recipient: userId,
            sender: dmId,
            campaign: campana._id,
            type: 'INVITE_RECEIVED',
            message: `${dm.username} te invita a unirte a "${campana.name}".`
        });

        res.json({ message: 'Invitación enviada. Esperando respuesta.', campaign: campana });
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar la invitación.' });
    }
});

// C. UNIRSE POR CÓDIGO MÁGICO (Requiere Aceptar del DM)
router.post('/join/code', async (req, res) => {
    try {
        const { userId, join_code } = req.body;
        const campana = await Campaign.findOne({ join_code: join_code.toUpperCase() });
        const jugador = await User.findById(userId);

        if (!campana) return res.status(404).json({ message: 'Código mágico inválido.' });
        if (campana.players.includes(userId)) return res.status(400).json({ message: 'Ya estás en esta campaña.' });
        if (campana.pending_requests.includes(userId)) return res.status(400).json({ message: 'Ya estás en la sala de espera.' });

        campana.pending_requests.push(userId);
        await campana.save();

        await Notification.create({
            recipient: campana.dungeon_master,
            sender: userId,
            campaign: campana._id,
            type: 'JOIN_REQUEST',
            message: `${jugador.username} ha usado el código mágico y pide entrar a "${campana.name}".`
        });

        res.json({ message: 'Has llamado a la puerta. Espera a que el DM te deje entrar.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al usar el código.' });
    }
});

// D. RESPONDER A INVITACIÓN (El jugador dice Sí/No)
router.post('/:id/respond-invite', async (req, res) => {
    try {
        const { userId, accept } = req.body; // accept es boolean
        const campana = await Campaign.findById(req.params.id);
        const jugador = await User.findById(userId);

        campana.pending_invites = campana.pending_invites.filter(id => id.toString() !== userId);

        if (accept) {
            campana.players.push(userId);
            jugador.campaigns.push(campana._id);
            await jugador.save();

            await Notification.create({
                recipient: campana.dungeon_master,
                sender: userId,
                campaign: campana._id,
                type: 'INVITE_ACCEPTED',
                message: `${jugador.username} ha aceptado unirse a "${campana.name}".`
            });
        }

        await campana.save();

        await Notification.deleteMany({ recipient: userId, campaign: campana._id, type: 'INVITE_RECEIVED' });

        res.json({ message: accept ? 'Te has unido a la campaña' : 'Invitación rechazada', campaign: campana, user: jugador });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la respuesta.' });
    }
});

// E. RESPONDER A PETICIÓN DE CÓDIGO (El DM dice Sí/No)
router.post('/:id/respond-request', async (req, res) => {
    try {
        const { dmId, userId, accept } = req.body;
        const campana = await Campaign.findById(req.params.id);
        const jugador = await User.findById(userId);

        campana.pending_requests = campana.pending_requests.filter(id => id.toString() !== userId);

        if (accept) {
            campana.players.push(userId);
            jugador.campaigns.push(campana._id);
            await jugador.save();

            await Notification.create({
                recipient: userId,
                sender: dmId,
                campaign: campana._id,
                type: 'REQUEST_ACCEPTED',
                message: `El DM te ha abierto las puertas de "${campana.name}".`
            });
        }

        await campana.save();

        await Notification.deleteMany({ recipient: dmId, sender: userId, campaign: campana._id, type: 'JOIN_REQUEST' });

        res.json({ message: accept ? 'Jugador aceptado' : 'Jugador rechazado', campaign: campana });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la petición.' });
    }
});

// E. RESPONDER A PETICIÓN DE CÓDIGO (El DM dice Sí/No)
router.post('/:id/respond-request', async (req, res) => {
    try {
        const { dmId, userId, accept } = req.body;
        const campana = await Campaign.findById(req.params.id);
        const jugador = await User.findById(userId);

        campana.pending_requests = campana.pending_requests.filter(id => id.toString() !== userId);

        if (accept) {
            campana.players.push(userId);
            jugador.campaigns.push(campana._id);
            await jugador.save();

            await Notification.create({
                recipient: userId,
                sender: dmId,
                campaign: campana._id,
                type: 'REQUEST_ACCEPTED',
                message: `El DM te ha abierto las puertas de "${campana.name}".`
            });
        }

        await campana.save();

        await Notification.deleteMany({ recipient: dmId, sender: userId, campaign: campana._id, type: 'JOIN_REQUEST' });

        res.json({ message: accept ? 'Jugador aceptado' : 'Jugador rechazado', campaign: campana });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la petición.' });
    }
});

// ==========================================
// EXPULSAR A UN JUGADOR DE LA CAMPAÑA
// ==========================================
router.delete('/:id/players/:playerId', async (req, res) => {
    try {
        const { id, playerId } = req.params;

        const campaign = await Campaign.findByIdAndUpdate(
            id,
            { $pull: { players: playerId } },
            { new: true }
        );

        if (!campaign) {
            return res.status(404).json({ message: 'Campaña no encontrada.' });
        }

        res.json({ message: 'Aventurero expulsado con éxito.' });
    } catch (error) {
        console.error('Error al expulsar jugador:', error);
        res.status(500).json({ message: 'Error interno al expulsar al jugador.' });
    }
});

// ==========================================
// CANCELAR UNA INVITACIÓN PENDIENTE
// ==========================================
router.delete('/:id/invites/:inviteId', async (req, res) => {
    try {
        const { id, inviteId } = req.params;

        const campaign = await Campaign.findByIdAndUpdate(
            id,
            { $pull: { pending_invites: inviteId } },
            { new: true }
        );

        if (!campaign) {
            return res.status(404).json({ message: 'Campaña no encontrada.' });
        }

        res.json({ message: 'Invitación cancelada correctamente.' });
    } catch (error) {
        console.error('Error al cancelar invitación:', error);
        res.status(500).json({ message: 'Error interno al cancelar la invitación.' });
    }
});

module.exports = router;
