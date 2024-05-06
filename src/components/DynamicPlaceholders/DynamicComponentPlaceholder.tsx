import { Box, CircularProgress } from '@mui/material';

export const DynamicComponentPlaceholder: React.FC = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
    <CircularProgress size={60} />
  </Box>
);
