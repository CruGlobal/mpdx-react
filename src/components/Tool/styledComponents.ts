import { Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ToolsGridContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingTop: 0,
  maxWidth: '1000px',
  display: 'flex',
  // MUI v7 Grid containers no longer default to width: 100%, so declare it at
  // every breakpoint or the container collapses to content width inside the
  // tools' centering flex Container
  width: '100%',
}));

export const LoadingBox = styled(Box)(() => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  marginLeft: '-28px',
  marginTop: '-28px',
  zIndex: 1000,
}));
