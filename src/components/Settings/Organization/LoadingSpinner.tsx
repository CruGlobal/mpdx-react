import { CircularProgress } from '@mui/material';

export const LoadingSpinner: React.FC<{ firstLoad: boolean }> = ({
  firstLoad,
}) => (
  <CircularProgress
    color="primary"
    size={35}
    sx={{
      marginRight: 3,
      position: 'absolute',
      top: firstLoad ? '50%' : 'inherit',
      bottom: firstLoad ? 'inherit' : '300px',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '300',
    }}
  />
);

export const SmallLoadingSpinner: React.FC<{ spacing?: string }> = ({
  spacing = '5px',
}) => (
  <CircularProgress color="primary" size={20} sx={{ marginRight: spacing }} />
);
