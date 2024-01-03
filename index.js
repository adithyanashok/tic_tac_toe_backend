const express = require('express')
const app = express()
const server = require("http").createServer(app)
const mongoose = require('mongoose')
const io = require('socket.io')(server);

const Room = require('./model/room')
const port = process.env.PORT || 5000


app.use(express.json())

const DB = "mongodb+srv://adithyan:tictactoe@cluster0.hy7zm.mongodb.net/tic_tac_toe?retryWrites=true&w=majority"


mongoose.connect(DB).then(() => {
    console.log("MongoDB connected");
}).catch((e) => {
    console.log(e)
})


io.on("connection", (socket) => {
    console.log("connected!");
    socket.on("createRoom", async ({ nickname }) => {
        console.log(nickname);
        try {
            // room is created
            let room = new Room();
            let player = {
                socketID: socket.id,
                nickname,
                playerType: "X",
            };
            room.players.push(player);
            room.turn = player;
            room = await room.save();
            console.log(room);
            const roomId = room._id.toString();

            socket.join(roomId);
            // io -> send data to everyone
            // socket -> sending data to yourself
            io.to(roomId).emit("createRoomSuccess", room);
        } catch (e) {
            console.log(e);
        }
    });

    socket.on("joinRoom", async ({ nickname, roomId }) => {
        try {
            if (!roomId.match(/^[0-9a-fA-F]{24}$/)) {
                socket.emit("errorOccurred", "Please enter a valid room ID.");
                return;
            }
            let room = await Room.findById(roomId);

            if (room.isJoin) {
                let player = {
                    nickname,
                    socketID: socket.id,
                    playerType: "O",
                };
                socket.join(roomId);
                room.players.push(player);
                room.isJoin = false;
                room = await room.save();
                io.to(roomId).emit("joinRoomSuccess", room);
                io.to(roomId).emit("updatePlayers", room.players);
                io.to(roomId).emit("updateTheRoom", room);
            } else {
                socket.emit(
                    "errorOccurred",
                    "The game is in progress, try again later."
                );
            }
        } catch (e) {
            console.log(e);
        }
    });

    socket.on("tap", async ({ index, roomId }) => {
        try {
            let room = await Room.findById(roomId);

            let choice = room.turn.playerType; // x or o
            if (room.turnIndex == 0) {
                room.turn = room.players[1];
                room.turnIndex = 1;
            } else {
                room.turn = room.players[0];
                room.turnIndex = 0;
            }
            room = await room.save();
            io.to(roomId).emit("tapped", {
                index,
                choice,
                room,
            });
        } catch (e) {
            console.log(e);
        }
    });
    socket.on("winner", async ({ winnerSocketId, roomId }) => {
        try {
            let room = await Room.findById(roomId)
            let player = room.players.find((player) => player.socketID == winnerSocketId)
            player.points += 1;
            room = await room.save();


            if (player.points >= room.maxRounds) {
                io.to(roomId).emit("endGame", player)
            } else {
                io.to(roomId).emit("pointIncrease", player)

            }
        } catch (error) {
            console.log(error)
        }
    });

});

server.listen(port, () => {

    console.log(`server running at http://localhost:${port}/`)
})