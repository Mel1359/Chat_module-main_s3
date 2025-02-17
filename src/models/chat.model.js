const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: String, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
