const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Notification = require('../models/notification'); // 👈 NUEVO: Importamos el tablón de anuncios

// 1. BUSCAR USUARIOS
router.get('/buscar', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const regex = new RegExp(q, 'i');
        const usuariosEncontrados = await User.find({
            $or: [{ username: regex }, { friend_code: regex }]
        })
            .select('username avatar_url friend_code')
            .limit(10);

        res.json(usuariosEncontrados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en la búsqueda arcana' });
    }
});

// 2. VER PERFIL PÚBLICO
router.get('/perfil/:id', async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id)
            .select('username avatar_url friend_code friends campaigns created_at')
            .populate('friends', 'username avatar_url friend_code')
            .populate('campaigns', 'name cover_url');

        if (!usuario) return res.status(404).json({ message: 'Aventurero no encontrado' });

        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al leer el perfil público' });
    }
});

// 3. ENVIAR SOLICITUD DE AMISTAD
router.post('/solicitar', async (req, res) => {
    try {
        const { miId, amigoId } = req.body;

        if (miId === amigoId) return res.status(400).json({ message: 'No puedes ser tu propio amigo.' });

        const amigo = await User.findById(amigoId);
        const yo = await User.findById(miId);

        if (!amigo || !yo) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (amigo.friends.includes(miId)) return res.status(400).json({ message: 'Ya formáis parte del mismo Gremio.' });
        if (amigo.friend_requests.includes(miId)) return res.status(400).json({ message: 'Ya enviaste un cuervo mensajero.' });

        amigo.friend_requests.push(miId);
        await amigo.save();

        if (!yo.sent_friend_requests.includes(amigoId)) {
            yo.sent_friend_requests.push(amigoId);
            await yo.save();
        }

        await Notification.create({
            recipient: amigoId,
            sender: miId,
            type: 'FRIEND_REQUEST',
            message: `${yo.username} te ha enviado una petición de amistad.`
        });

        res.json({ message: 'Solicitud de amistad enviada con éxito 🦅', user: yo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al enviar la solicitud' });
    }
});

// 4. ACEPTAR SOLICITUD
router.post('/aceptar', async (req, res) => {
    try {
        const { miId, solicitanteId } = req.body;

        const yo = await User.findById(miId);
        const solicitante = await User.findById(solicitanteId);

        if (!yo || !solicitante) return res.status(404).json({ message: 'Usuario no encontrado' });

        yo.friend_requests = yo.friend_requests.filter(id => id.toString() !== solicitanteId);

        solicitante.sent_friend_requests = solicitante.sent_friend_requests.filter(id => id.toString() !== miId);

        if (!yo.friends.includes(solicitanteId)) yo.friends.push(solicitanteId);
        if (!solicitante.friends.includes(miId)) solicitante.friends.push(miId);

        await yo.save();
        await solicitante.save();

        await Notification.deleteMany({ recipient: miId, sender: solicitanteId, type: 'FRIEND_REQUEST' });

        await Notification.create({
            recipient: solicitanteId,
            sender: miId,
            type: 'FRIEND_ACCEPTED',
            message: `${yo.username} ha aceptado tu petición y se ha unido a tu gremio.`
        });

        res.json({ message: '¡Nuevo miembro en el Gremio! 🍻', user: yo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al aceptar la solicitud' });
    }
});

// 5. RECHAZAR SOLICITUD
router.post('/rechazar', async (req, res) => {
    try {
        const { miId, solicitanteId } = req.body;

        const yo = await User.findById(miId);
        const solicitante = await User.findById(solicitanteId);

        if (!yo) return res.status(404).json({ message: 'Usuario no encontrado' });

        yo.friend_requests = yo.friend_requests.filter(id => id.toString() !== solicitanteId);
        await yo.save();

        if (solicitante) {
            solicitante.sent_friend_requests = solicitante.sent_friend_requests.filter(id => id.toString() !== miId);
            await solicitante.save();
        }

        await Notification.deleteMany({ recipient: miId, sender: solicitanteId, type: 'FRIEND_REQUEST' });

        res.json({ message: 'Solicitud rechazada cordialmente.', user: yo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al rechazar la solicitud' });
    }
});

// 6. CANCELAR SOLICITUD ENVIADA
router.post('/cancelar', async (req, res) => {
    try {
        const { miId, receptorId } = req.body;

        const yo = await User.findById(miId);
        const receptor = await User.findById(receptorId);

        if (!yo) return res.status(404).json({ message: 'Usuario no encontrado' });

        yo.sent_friend_requests = yo.sent_friend_requests.filter(id => id.toString() !== receptorId);
        await yo.save();

        if (receptor) {
            receptor.friend_requests = receptor.friend_requests.filter(id => id.toString() !== miId);
            await receptor.save();
        }

        await Notification.deleteMany({ recipient: receptorId, sender: miId, type: 'FRIEND_REQUEST' });

        res.json({ message: 'Has interceptado al cuervo. Solicitud cancelada.', user: yo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cancelar la solicitud' });
    }
});

// 7. ELIMINAR AMIGO
router.post('/eliminar', async (req, res) => {
    try {
        const { miId, amigoId } = req.body;

        const yo = await User.findById(miId);
        const amigo = await User.findById(amigoId);

        if (!yo) return res.status(404).json({ message: 'Usuario no encontrado' });

        yo.friends = yo.friends.filter(id => id.toString() !== amigoId);
        await yo.save();

        if (amigo) {
            amigo.friends = amigo.friends.filter(id => id.toString() !== miId);
            await amigo.save();
        }


        res.json({ message: 'El aventurero ha sido expulsado de tu gremio.', user: yo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar al amigo' });
    }
});

router.get('/lista', async (req, res) => {
    try {
        const ids = req.query.ids.split(',');
        const users = await User.find({ _id: { $in: ids } }).select('username avatar_url friend_code');
        res.json(users);
    } catch (err) {
        res.status(500).json([]);
    }
});

module.exports = router;