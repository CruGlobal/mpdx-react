import TagIcon from '@mui/icons-material/LocalOfferOutlined';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ContactTagIcon = styled(TagIcon)(({ theme }) => ({
  color: theme.palette.cruGrayMedium.main,
  marginRight: theme.spacing(1),
}));

export const ContactTagInput = styled(TextField)(({ theme }) => ({
  '&& .MuiInput-underline:before ': {
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  '&& .MuiInput-underline:after ': {
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  '&& .MuiInputBase-input': {
    minWidth: '200px',
  },
  '& ::placeholder': {
    color: theme.palette.info.main,
    opacity: 1,
  },
  '& :hover::placeholder': {
    textDecoration: 'underline',
  },
  '& :focus::placeholder': {
    textDecoration: 'none',
    color: theme.palette.cruGrayMedium.main,
  },
  margin: theme.spacing(1),
  marginLeft: '0',
}));
