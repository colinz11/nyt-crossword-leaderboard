import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // Replace with your backend's base URL

/**
 * Fetch user stats from the backend.
 * @param userID - The ID of the user whose stats are to be fetched.
 * @returns A promise resolving to the user stats data.
 */
export const fetchUserStats = async (userID: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/stats/${userID}`);
        return response.data; // Return the stats data from the response
    } catch (error) {
        console.error(`Error fetching user stats for userID ${userID}:`, error);
        throw error; // Re-throw the error for the caller to handle
    }
};