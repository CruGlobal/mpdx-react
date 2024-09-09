import { CircularProgress, Fab } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFab = styled(Fab)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  cursor: 'default',
  '&:hover': {
    backgroundColor: theme.palette.common.white,
  },
}));

export const StyledFabLoading: React.FC = () => {
  return (
    <StyledFab color="default" disableRipple>
      <CircularProgress
        color="primary"
        size={30}
        data-testid="LoadingSpinner"
      />
    </StyledFab>
  );
};
