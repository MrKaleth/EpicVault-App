const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Quién recibe el cuervo
    sender: { type: Schema.Types.ObjectId, ref: 'User' }, // Quién envió el cuervo
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' }, // (Opcional) La campaña en cuestión

    type: {
        type: String,
        enum: [
            // --- EVENTOS DE CAMPAÑA ---
            'AUTO_JOIN',        // Te han añadido directamente a una campaña (Solo info)
            'INVITE_RECEIVED',  // Te han invitado a una campaña (Aceptar / Rechazar)
            'INVITE_ACCEPTED',  // Alguien aceptó tu invitación (Solo info DM)
            'JOIN_REQUEST',     // Alguien usó tu código para entrar (Aceptar / Rechazar DM)
            'REQUEST_ACCEPTED', // El DM te dejó entrar (Solo info Jugador)
            'FRIEND_REQUEST',   // Alguien quiere unirse a tu gremio (Aceptar / Rechazar)
            'FRIEND_ACCEPTED'   // Alguien aceptó la solicitud que tú enviaste (Solo info)
        ],
        required: true
    },
    message: String, // Ej: "Dario#1234 quiere añadirte a su lista de amigos."
    read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;