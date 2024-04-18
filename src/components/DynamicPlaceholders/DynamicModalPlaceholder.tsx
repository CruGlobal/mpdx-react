import { Box, CircularProgress } from '@mui/material';

export const DynamicModalPlaceholder: React.FC = () => (
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '300',
    }}
  >
    <CircularProgress size={60} />
  </Box>
);
