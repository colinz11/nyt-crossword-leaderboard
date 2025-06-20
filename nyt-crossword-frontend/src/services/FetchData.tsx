import axios from 'axios';
import moment from 'moment';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_KEY = process.env.REACT_APP_API_KEY;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'X-API-Key': API_KEY,
    }
});

/**
 * Fetch user stats from the backend.
 * @param userID - The ID of the user whose stats are to be fetched.
 * @param startDate - Optional start date for filtering stats (YYYY-MM-DD).
 * @param endDate - Optional end date for filtering stats (YYYY-MM-DD).
 * @returns A promise resolving to the user stats data.
 */
export const fetchUserStats = async (userID: string, startDate?: string | null, endDate?: string) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const url = `/api/users/stats/${userID}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user stats for userID ${userID}:`, error);
        throw error;
    }
};

/**
 * Refresh user solutions from NYT in batches.
 * @param userID - The ID of the user whose solutions should be refreshed.
 * @param startDate - Optional start date for refreshing solutions (YYYY-MM-DD).
 * @param endDate - Optional end date for refreshing solutions (YYYY-MM-DD).
 * @param batchSize - Number of days to process in each batch (default: 30).
 * @param onProgress - Callback for progress updates.
 * @returns A promise resolving when all batches are complete.
 */
export const refreshUserSolutions = async (
    userID: string, 
    startDate?: string | null, 
    endDate?: string,
    batchSize: number = 30,
    onProgress?: (progress: { completed: number; total: number }) => void
) => {
    try {
        const start = startDate ? moment(startDate) : moment().subtract(1, 'year');
        const end = endDate ? moment(endDate) : moment();
        const totalDays = end.diff(start, 'days');
        let completed = 0;

        // Calculate the number of batches
        const batches = [];
        let currentStart = start.clone();
        while (currentStart.isBefore(end)) {
            const batchEnd = moment.min(currentStart.clone().add(batchSize, 'days'), end);
            batches.push({
                start: currentStart.format('YYYY-MM-DD'),
                end: batchEnd.format('YYYY-MM-DD')
            });
            currentStart = batchEnd.clone().add(1, 'days');
        }

        // Process each batch sequentially
        for (const batch of batches) {
            await api.post(`/api/nyt/fetch-solutions`, { 
                userID, 
                start: batch.start, 
                end: batch.end 
            });
            
            completed += moment(batch.end).diff(moment(batch.start), 'days') + 1;
            onProgress?.({
                completed: Math.min(completed, totalDays),
                total: totalDays
            });

            // Small delay between batches to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return { message: 'All solutions refreshed successfully' };
    } catch (error) {
        console.error(`Error refreshing solutions for userID ${userID}:`, error);
        throw error;
    }
};

/**
 * Fetch puzzle data for a specific date from the backend.
 * @param dateString - The date string in YYYY-MM-DD format.
 * @returns A promise resolving to the puzzle data for the given date.
 */
export const fetchPuzzleDataByDate = async (dateString: string) => {
    try {
        const response = await api.get(`/api/puzzles/by-date/${dateString}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching puzzle data for date ${dateString}:`, error);
        throw error;
    }
};

/**
 * Fetch today's puzzle data from the backend.
 * @returns A promise resolving to today's puzzle data.
 */
export const fetchTodaysPuzzleData = async () => {
    try {
        const response = await api.get(`/api/puzzles/today`);
        return response.data;
    } catch (error) {
        console.error('Error fetching today\'s puzzle data:', error);
        throw error;
    }
};

export const fetchLeaderboardByAverageTime = async (limit: number = 5, timestamp?: number) => {
    try {
        const url = `/api/leaderboard/average-time?limit=${limit}${timestamp ? `&t=${timestamp}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching leaderboard by average time:`, error);
        throw error;
    }
};

export const fetchLeaderboardByPuzzlesSolved = async (limit: number = 5, timestamp?: number) => {
    try {
        const url = `/api/leaderboard/puzzles-solved?limit=${limit}${timestamp ? `&t=${timestamp}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching leaderboard by puzzles solved:`, error);
        throw error;
    }
};

export const fetchLeaderboardByLongestStreak = async (limit: number = 5, timestamp?: number) => {
    try {
        const url = `/api/leaderboard/longest-streak?limit=${limit}${timestamp ? `&t=${timestamp}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching leaderboard by longest streak:`, error);
        throw error;
    }
};

export const fetchGameSolutions = async (puzzleID: string) => {
    try {
        const response = await api.get(`/api/puzzles/${puzzleID}/solutions`);
        return response.data; // Return the stats data from the response
    } catch (error) {
        console.error(`Error fetching puzzle solutions for puzzleID ${puzzleID}:`, error);
        throw error; // Re-throw the error for the caller to handle
    }
};

/**
 * Verify NYT token and create a new user.
 * @param username - The username for the new user
 * @param token - The NYT token to verify
 * @returns A promise resolving to the created user data
 */
export const verifyAndCreateUser = async (username: string, token: string) => {
    try {
        // Calculate expiration date (1 year from now)
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);

        const response = await api.post(`/api/users/verify`, {
            username,
            token,
            expirationDate: expirationDate.toISOString()
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying user:', error);
        throw error;
    }
};