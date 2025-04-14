// Utility function to format time as mm:ss or just seconds
export const formatTime = (timeInSeconds: number | null): string => {
    if (timeInSeconds === null) {
      return 'N/A'; // Handle null case
    }
    if (timeInSeconds < 60) {
      return `${timeInSeconds}s`; // Display seconds if less than 60
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.round(timeInSeconds % 60); // Round to the nearest second
    return `${minutes}:${seconds.toString().padStart(2, '0')}m`; // Add 'm' to indicate minutes
  };