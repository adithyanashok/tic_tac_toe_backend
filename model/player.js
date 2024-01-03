const mongoose = require('mongoose')

const playerModel = new mongoose.Schema({
    nickname: { type: String, trim: true },
    socketID: { type: String },
    points: { type: Number, default: 0 },
    playerType: { type: String, required: true },
})

module.exports = playerModel;