const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// In-memory storage for simplicity
let gameHistory = [];
let leaderboard = {};

// API endpoint to get game history
app.get('/api/history', (req, res) => {
    res.json(gameHistory);
});

// API endpoint to get leaderboard
app.get('/api/leaderboard', (req, res) => {
    const sortedLeaderboard = Object.entries(leaderboard)
        .map(([player, score]) => ({ player, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    res.json(sortedLeaderboard);
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle spin event
    socket.on('spin', (data) => {
        const { player, result, winAmount } = data;

        // Update game history
        const spinResult = { player, result, winAmount, timestamp: new Date() };
        gameHistory.push(spinResult);

        // Update leaderboard
        if (leaderboard[player]) {
            leaderboard[player] += winAmount;
        } else {
            leaderboard[player] = winAmount;
        }

        io.emit('update', { gameHistory, leaderboard });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
