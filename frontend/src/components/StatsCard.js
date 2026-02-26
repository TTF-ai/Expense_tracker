import React from 'react';

const StatsCard = ({ icon, label, value, color, subtext }) => {
    return (
        <div className="stats-card" style={{ '--card-accent': color }}>
            <div className="stats-card-icon" style={{ background: color }}>
                {icon}
            </div>
            <div className="stats-card-info">
                <p className="stats-card-label">{label}</p>
                <h3 className="stats-card-value">{value}</h3>
                {subtext && <p className="stats-card-subtext">{subtext}</p>}
            </div>
        </div>
    );
};

export default StatsCard;
