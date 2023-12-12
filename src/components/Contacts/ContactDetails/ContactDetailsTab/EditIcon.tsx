import CreateIcon from '@mui/icons-material/Create';
import { styled } from '@mui/material/styles';

export const EditIcon = styled(CreateIcon)(({ theme }) => ({
  width: '18px',
  height: '18px',
  margin: theme.spacing(0),
  color: theme.palette.cruGrayMedium.main,
}));
