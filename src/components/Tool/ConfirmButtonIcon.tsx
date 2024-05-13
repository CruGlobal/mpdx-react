import { mdiCheckboxMarkedCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { styled } from '@mui/material/styles';

const StyledIcon = styled(Icon)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

export const ConfirmButtonIcon: React.FC = () => (
  <StyledIcon path={mdiCheckboxMarkedCircle} size={0.8} />
);
