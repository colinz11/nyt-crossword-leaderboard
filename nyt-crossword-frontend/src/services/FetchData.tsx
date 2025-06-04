import axios from 'axios';

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
 * @returns A promise resolving to the user stats data.
 */
export const fetchUserStats = async (userID: string) => {
    try {
        const response = await api.get(`/api/users/stats/${userID}`);
        return response.data; // Return the stats data from the response
    } catch (error) {
        console.error(`Error fetching user stats for userID ${userID}:`, error);
        throw error; // Re-throw the error for the caller to handle
    }
};

/**
 * Refresh user solutions from NYT.
 * @param userID - The ID of the user whose solutions should be refreshed.
 * @returns A promise resolving when the refresh is complete.
 */
export const refreshUserSolutions = async (userID: string) => {
    try {
        // Get dates for the last 30 days
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        const response = await api.post(`/api/nyt/solutions`, {
            userID,
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
        return response.data;
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

export const fetchLeaderboardByAverageTime = async (limit: number = 5) => {
    try {
        const response = await api.get(`/api/leaderboard/average-time?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching leaderboard by average time:`, error);
        throw error;
    }
};

export const fetchLeaderboardByPuzzlesSolved = async (limit: number = 5) => {
    try {
        const response = await api.get(`/api/leaderboard/puzzles-solved?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching leaderboard by puzzles solved:`, error);
        throw error;
    }
};

export const fetchLeaderboardByLongestStreak = async (limit: number = 5) => {
    try {
        const response = await api.get(`/api/leaderboard/longest-streak?limit=${limit}`);
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