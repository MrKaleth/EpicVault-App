const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    
    // Relaciones
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    
    // Permisos
    isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);