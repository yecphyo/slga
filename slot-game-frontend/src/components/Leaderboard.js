import React from 'react';
import './Leaderboard.css';

const Leaderboard = ({ leaderboard }) => {
    return (
        <div className="leaderboard">
            <h3>Leaderboard</h3>
            <table>
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.player}</td>
                            <td>${entry.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
