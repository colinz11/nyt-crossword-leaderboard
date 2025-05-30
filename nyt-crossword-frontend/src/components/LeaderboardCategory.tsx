import React from 'react';
import {
    Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper
} from '@mui/material';


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

const LeaderboardCategory: React.FC<LeaderboardCategoryProps> = ({ title, subtitle, entries, valueSuffix }) => (
    <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
            {title}
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 2 }}>
            {subtitle}
        </Typography>
        {entries.length > 0 ? (
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell align="right">{entries[0].valueLabel}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {entries.map((entry, index) => (
                        <TableRow key={entry.userID}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{entry.username || entry.userID}</TableCell>
                            <TableCell align="right">
                                {entry.value}
                                {valueSuffix ? ` ${valueSuffix}` : ''}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : <Typography align="center">No data available.</Typography>}
    </Paper>
);

export default LeaderboardCategory;