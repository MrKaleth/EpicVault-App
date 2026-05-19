const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    race: { type: String, required: true },
    class: { type: String, required: true },
    level: { type: Number, default: 1 },
    avatar_url: { type: String, default: '' },
    
    // Relaciones
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },

    // Sistema de Economía D&D
    public_money: {
        pc: { type: Number, default: 0 },
        pp: { type: Number, default: 0 },
        pe: { type: Number, default: 0 },
        po: { type: Number, default: 0 },
        ppt: { type: Number, default: 0 } 
    },

    private_money: {
        pc: { type: Number, default: 0 },
        pp: { type: Number, default: 0 },
        pe: { type: Number, default: 0 },
        po: { type: Number, default: 0 },
        ppt: { type: Number, default: 0 } 
    },

    // Inventario
    inventory: [{
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        description: { type: String, default: '' },
        isEquipped: { type: Boolean, default: false },
        isPublic: { type: Boolean, default: false }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Character', characterSchema);