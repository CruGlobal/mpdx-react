import { Box, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { multiPageHeaderHeight } from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';

export const iconPanelWidth = theme.spacing(5);

export const PrintableStack = styled(Stack)({
  '@media print': {
    // Hide all children except for the main content
    '> *:not(.main-content)': {
      display: 'none',
    },
  },
});

export const MainContent = styled('div')(({ theme }) => ({
  paddingBlock: theme.spacing(4),
  width: '100%',
  '@media screen': {
    height: `calc(100vh - ${navBarHeight} - ${multiPageHeaderHeight})`,
    overflow: 'scroll',
  },
}));

export const SidebarTitle = styled(Typography)(({ theme }) => ({
  marginBottom: 0,
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(2),
}));

export const StyledSidebar = styled('nav', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  width: open ? 240 : 0,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflow: 'hidden',
  borderRight: open ? `1px solid ${theme.palette.cruGrayLight.main}` : 'none',
  [theme.breakpoints.down('sm')]: {
    position: 'absolute',
    top: multiPageHeaderHeight,
    left: `calc(${iconPanelWidth} + 1px)`,
    height: '100%',
    backgroundColor: theme.palette.common.white,
    zIndex: 270,
  },
}));

export const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));
