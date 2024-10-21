import React, { useState, useEffect } from 'react';
import Reel from './Reel';
import Controls from './Controls';
import Leaderboard from './Leaderboard';
import { SYMBOLS } from '../symbols';
import io from 'socket.io-client';
import axios from 'axios';
import './SlotMachine.css';

const SOCKET_SERVER_URL = 'http://localhost:4000';

const SlotMachine = () => {
    const [reels, setReels] = useState(generateReels());
    const [spinning, setSpinning] = useState(false);
    const [paylines, setPaylines] = useState(1);
    const [betPerLine, setBetPerLine] = useState(1);
    const [balance, setBalance] = useState(1000);
    const [wins, setWins] = useState([]);
    const [gameHistory, setGameHistory] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [socket, setSocket] = useState(null);
    const playerName = `Player${Math.floor(Math.random() * 100)}`;

    useEffect(() => {
        // Initialize Socket.IO
        const newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);

        // Fetch initial game history and leaderboard
        fetchGameHistory();
        fetchLeaderboard();

        // Listen for updates
        newSocket.on('update', (data) => {
            setGameHistory(data.gameHistory);
            setLeaderboard(Object.entries(data.leaderboard)
                .map(([player, score]) => ({ player, score }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 10));
        });

        return () => newSocket.close();
    }, []);

    const fetchGameHistory = async () => {
        try {
            const res = await axios.get(`${SOCKET_SERVER_URL}/api/history`);
            setGameHistory(res.data);
        } catch (error) {
            console.error('Error fetching game history:', error);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get(`${SOCKET_SERVER_URL}/api/leaderboard`);
            setLeaderboard(res.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    function generateReels() {
        return Array.from({ length: 5 }, () =>
            Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
        );
    }

    const spin = () => {
        if (spinning) return;
        if (balance < paylines * betPerLine) {
            alert('Insufficient balance!');
            return;
        }

        setSpinning(true);
        setBalance(balance - paylines * betPerLine);

        const newReels = generateReels();
        setReels(newReels);

        setTimeout(() => {
            setSpinning(false);
            const winAmount = checkWins(newReels);
            setBalance(balance + winAmount);
            if (socket) {
                socket.emit('spin', {
                    player: playerName,
                    result: newReels,
                    winAmount
                });
            }
        }, 2000);
    };

    const checkWins = (currentReels) => {
        const firstRow = currentReels.map(reel => reel[0]);
        const secondRow = currentReels.map(reel => reel[1]);
        const thirdRow = currentReels.map(reel => reel[2]);
        const isWin = firstRow.every(symbol => symbol === firstRow[0])
            || secondRow.every(symbol => symbol === secondRow[0])
            || thirdRow.every(symbol => symbol === thirdRow[0]);

        if (isWin) {
            const win = betPerLine * paylines * 10;
            setWins([...wins, win]);
            return win;
        }
        return 0;
    };

    return (
        <div className="slot-machine">
            <h1>React Slot Machine</h1>
            <div className="reels">
                {reels.map((reelSymbols, index) => (
                    <Reel key={index} symbols={reelSymbols} spinning={spinning} />
                ))}
            </div>
            <Controls
                paylines={paylines}
                setPaylines={setPaylines}
                betPerLine={betPerLine}
                setBetPerLine={setBetPerLine}
                spin={spin}
            />
            <div className="balance">
                <h3>Balance: ${balance}</h3>
            </div>
            <Leaderboard leaderboard={leaderboard} />
            <div className="game-history">
                <h3>Game History</h3>
                <ul>
                    {gameHistory.slice(-10).map((spin, index) => (
                        <li key={index}>
                            {spin.player} spun and won ${spin.winAmount} at {new Date(spin.timestamp).toLocaleTimeString()}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SlotMachine;
