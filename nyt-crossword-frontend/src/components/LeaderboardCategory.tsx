import React from 'react';
import './LeaderboardCategory.css';

// Interfaces for leaderboard data
interface LeaderboardEntry {
    userID: string;
    username?: string;
    value: number | string;
    valueLabel: string;
}

interface LeaderboardCategoryProps {
    title: string;
    subtitle: string;
    entries: LeaderboardEntry[];
    valueSuffix?: string;
}

const LeaderboardCategory: React.FC<LeaderboardCategoryProps> = ({ title, subtitle, entries, valueSuffix }) => {
    const getRankClass = (rank: number) => {
        switch (rank) {
            case 1: return 'rank-first';
            case 2: return 'rank-second';
            case 3: return 'rank-third';
            default: return '';
        }
    };

    return (
        <div className="leaderboard-category">
            <div className="leaderboard-header">
                <h2 className="leaderboard-title">{title}</h2>
                <p className="leaderboard-subtitle">{subtitle}</p>
            </div>
            
            {entries.length > 0 ? (
                <div className="leaderboard-table-container">
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>User</th>
                                <th>{entries[0].valueLabel}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, index) => (
                                <tr key={entry.userID} className={getRankClass(index + 1)}>
                                    <td className="rank-cell">
                                        <span className="rank-number">{index + 1}</span>
                                    </td>
                                    <td className="user-cell">{entry.username || entry.userID}</td>
                                    <td className="value-cell">
                                        {entry.value}
                                        {valueSuffix ? ` ${valueSuffix}` : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="no-data">No data available.</div>
            )}
        </div>
    );
};

export default LeaderboardCategory;