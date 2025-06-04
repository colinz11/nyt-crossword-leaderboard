import { track } from '@vercel/analytics';

// User events
export const trackUserLogin = (success: boolean) => {
    track('user_login', { success });
};

export const trackUserRegistration = (success: boolean) => {
    track('user_registration', { success });
};

// Puzzle events
export const trackPuzzleView = (date: string) => {
    track('puzzle_view', { date });
};

// Leaderboard events
export const trackLeaderboardView = (category: string) => {
    track('leaderboard_view', { category });
};

export const trackUserProfileView = (userID: string) => {
    track('user_profile_view', { userID });
}; 