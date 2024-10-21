import React from 'react';
import './Reel.css';

const Reel = ({ symbols, spinning }) => {
    return (
        <div className={`reel ${spinning ? 'spinning' : ''}`}>
            {symbols.map((symbol, index) => (
                <div key={index} className="symbol">
                    {symbol}
                </div>
            ))}
        </div>
    );
};

export default Reel;
