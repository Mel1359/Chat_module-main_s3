const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: { type: String, required: true },
    senderId: { type: String, required: true },
    content: { type: String },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
