import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StickyHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'onTransactionPage',
})<{ onTransactionPage?: boolean }>(({ theme, onTransactionPage }) => ({
  backgroundColor: theme.palette.common.white,
  position: 'sticky',
  top: 0,
  height: onTransactionPage ? 185 : 105,
  '@media print': {
    paddingTop: '0',
  },
  zIndex: 500,
}));
