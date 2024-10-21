import React from 'react';
import './Controls.css';

const Controls = ({ paylines, setPaylines, betPerLine, setBetPerLine, spin }) => {
    return (
        <div className="controls">
            <div className="control-group">
                <label>Paylines:</label>
                <input
                    type="number"
                    value={paylines}
                    min="1"
                    max="25"
                    onChange={(e) => setPaylines(Number(e.target.value))}
                />
            </div>
            <div className="control-group">
                <label>Bet per Line:</label>
                <input
                    type="number"
                    value={betPerLine}
                    min="1"
                    onChange={(e) => setBetPerLine(Number(e.target.value))}
                />
            </div>
            <button onClick={spin}>Spin</button>
        </div>
    );
};

export default Controls;
