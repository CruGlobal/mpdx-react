import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const HeaderBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  borderBottom: '1px solid #bfbfbf',
  borderRadius: '1px',
  boxShadow: '0 1px 1px rgba(0, 0, 0, .05)',
  borderTopLeftRadius: '3px',
  borderTopRightRadius: '3px',
  cursor: 'default',
  display: 'inline-block',
  lineHeight: '23px',
  marginBottom: '5px',
  padding: '10px 15px',
  transition: 'border-color .5s',
  userSelect: 'none',
  width: '100%',
}));
