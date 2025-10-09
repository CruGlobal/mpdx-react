import React from 'react';
import {
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { CircularProgressWithLabel } from 'src/components/Reports/GoalCalculator/SharedComponents/CircularProgressWithLabel/CircularProgressWithLabel';
import { multiPageHeaderHeight } from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';

const iconPanelWidth = theme.spacing(5);

const PrintableStack = styled(Stack)({
  '@media print': {
    // Hide all children except for the main content
    '> *:not(.main-content)': {
      display: 'none',
    },
  },
});

const MainContent = styled('div')(({ theme }) => ({
  paddingBlock: theme.spacing(4),
  width: '100%',
  '@media screen': {
    height: `calc(100vh - ${navBarHeight} - ${multiPageHeaderHeight})`,
    overflow: 'scroll',
  },
}));

const SidebarTitle = styled(Typography)(({ theme }) => ({
  marginBottom: 0,
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(2),
}));

const StyledSidebar = styled('nav', {
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

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export interface IconPanelItem {
  key?: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export interface IconPanelLayoutProps {
  percentComplete: number;
  iconPanelItems?: IconPanelItem[];
  sidebarContent?: React.ReactNode;
  backButton: IconPanelItem;
  sidebarTitle?: string;
  isSidebarOpen?: boolean;
  sidebarAriaLabel?: string;
  mainContent: React.ReactNode;
}

/**
 * Shared left side component for multi-step navigation.
 * Refer to GoalCalculatorLayout.tsx for an implementation example.
 */
export const IconPanelLayout: React.FC<IconPanelLayoutProps> = ({
  percentComplete,
  iconPanelItems,
  sidebarContent,
  sidebarTitle,
  isSidebarOpen = false,
  sidebarAriaLabel,
  backButton,
  mainContent,
}) => {
  return (
    <PrintableStack direction="row">
      <Stack direction="column" width={iconPanelWidth}>
        <StyledBox>
          <CircularProgressWithLabel progress={percentComplete} />
        </StyledBox>
        {iconPanelItems?.map((item) => (
          <IconButton
            key={item.key}
            aria-label={item.label}
            sx={{
              color: item.isActive
                ? theme.palette.mpdxBlue.main
                : theme.palette.cruGrayDark.main,
            }}
            onClick={item.onClick}
          >
            {item.icon}
          </IconButton>
        ))}
        <IconButton
          aria-label={backButton.label}
          sx={{
            color: theme.palette.cruGrayDark.main,
          }}
          onClick={backButton.onClick}
        >
          {backButton.icon}
        </IconButton>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <StyledSidebar
        open={isSidebarOpen}
        aria-label={sidebarAriaLabel}
        aria-expanded={isSidebarOpen}
      >
        {sidebarTitle && (
          <SidebarTitle variant="h6">{sidebarTitle}</SidebarTitle>
        )}
        {sidebarContent}
      </StyledSidebar>
      <Divider orientation="vertical" flexItem />
      <MainContent className="main-content">{mainContent}</MainContent>
    </PrintableStack>
  );
};
