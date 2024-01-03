const mongoose = require('mongoose')
const playerModel = require('./player')

const roomSchema = new mongoose.Schema({
    occupancy: {
        type: Number,
        default: 2
    },
    maxRounds: {
        type: Number,
        default: 6,
    },
    currentRound: {
        required: true,
        type: Number,
        default: 1,
    },
    players: [playerModel],
    isJoin: {
        type: Boolean,
        default: true,
    },
    turn: playerModel,
    turnIndex: {
        type: Number,
        default: 0,
    }
})

const roomModel = mongoose.model('Room', roomSchema)
module.exports = roomModel;
