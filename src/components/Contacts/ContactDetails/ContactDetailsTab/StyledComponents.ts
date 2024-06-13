import Add from '@mui/icons-material/Add';
import Create from '@mui/icons-material/Create';
import Lock from '@mui/icons-material/Lock';
import { Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const AddIcon = styled(Add)(({ theme }) => ({
  color: theme.palette.info.main,
}));

export const EditIcon = styled(Create)(({ theme }) => ({
  width: '18px',
  height: '18px',
  margin: theme.spacing(0),
  color: theme.palette.cruGrayMedium.main,
}));

export const AddButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

export const AddText = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

export const LockIcon = styled(Lock)(({ theme }) => ({
  width: '18px',
  height: '18px',
  margin: theme.spacing(0),
  color: theme.palette.cruGrayMedium.main,
}));
