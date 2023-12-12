import { Box, CircularProgress } from '@mui/material';

export const DynamicComponentPlaceholder: React.FC = () => (
  <Box display="flex" justifyContent="center" alignItems="center">
    <CircularProgress size={20} />
  </Box>
);
