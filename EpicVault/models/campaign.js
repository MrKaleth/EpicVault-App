const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const campaignSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: 'Una nueva aventura comienza...'
    },
    cover_url: {
        type: String,
        default: 'https://images.unsplash.com/photo-1614273618169-2f22b7244de1?q=80&w=1000&auto=format&fit=crop'
    },
    dungeon_master: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    join_code: {
        type: String,
        unique: true,
        default: generateJoinCode 
    },
    pending_invites: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    pending_requests: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    

    // Para el futuro: estado de la campaña (activa, pausada, finalizada)
    status: {
        type: String,
        enum: ['ACTIVE', 'PAUSED', 'COMPLETED'],
        default: 'ACTIVE'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;