import React from 'react';
import { Box, Typography, List as MuiList, ListItem as MuiListItem } from '@mui/material'; // Using Mui imports
import { CrosswordClues } from './CrosswordDisplay'; // Assuming CrosswordClues is exported

interface ClueDisplayProps {
  clues: CrosswordClues;
  maxHeight?: string | number; // Optional max height for scrolling
}

const ClueDisplay: React.FC<ClueDisplayProps> = ({ clues, maxHeight }) => {
  if (!clues || (!clues.across && !clues.down)) {
    return <Typography>No clues available.</Typography>;
  }

  return (
    <Box sx={{ maxHeight: maxHeight || 'auto', overflowY: maxHeight ? 'auto' : 'visible' }}>
      {clues.across && Object.keys(clues.across).length > 0 && (
        <Box mb={2}> {/* Added mb={2} for spacing between Across and Down sections */}
          <Typography variant="h6">Across</Typography>
          <MuiList sx={{ listStyleType: 'none', p: 0 }}>
            {Object.entries(clues.across).map(([num, clue]) => (
              <MuiListItem key={`across-${num}`} sx={{ py: 0.2, px: 0, display: 'block' }}>
                <Typography variant="body2"><strong>{num}.</strong> {clue}</Typography>
              </MuiListItem>
            ))}
          </MuiList>
        </Box>
      )}
      {clues.down && Object.keys(clues.down).length > 0 && (
        <Box>
          <Typography variant="h6">Down</Typography>
          <MuiList sx={{ listStyleType: 'none', p: 0 }}>
            {Object.entries(clues.down).map(([num, clue]) => (
              <MuiListItem key={`down-${num}`} sx={{ py: 0.2, px: 0, display: 'block' }}>
                <Typography variant="body2"><strong>{num}.</strong> {clue}</Typography>
              </MuiListItem>
            ))}
          </MuiList>
        </Box>
      )}
    </Box>
  );
};

export default ClueDisplay;
