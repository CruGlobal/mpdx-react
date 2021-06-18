import { FC, ReactElement } from 'react';
import { Box, styled, Theme } from '@material-ui/core';
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints';

const FullHeightBox = styled(Box)(({ theme }) => ({
  height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
  ['@media (min-width:0px) and (orientation: landscape)']: {
    height: `calc(100vh - ${
      (theme.mixins.toolbar[
        '@media (min-width:0px) and (orientation: landscape)'
      ] as { minHeight: number }).minHeight
    }px)`,
  },
  ['@media (min-width:600px)']: {
    height: `calc(100vh - ${
      (theme.mixins.toolbar['@media (min-width:600px)'] as {
        minHeight: number;
      }).minHeight
    }px)`,
  },
}));

const ScrollBox = styled(FullHeightBox)({
  overflowY: 'auto',
});

const CollapsibleWrapper = styled(Box)({
  display: 'flex',
  overflowX: 'hidden',
});

const ExpandingContent = styled(Box)(
  ({ open }: { theme: Theme; open: boolean }) => ({
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: open ? 0 : '100%',
    transition: 'flex-basis ease-in-out 225ms',
    overflowX: 'hidden',
  }),
);

const PanelWrapper = styled(ScrollBox)(
  ({
    theme,
    breakpoint,
  }: {
    theme: Theme;
    breakpoint: Breakpoint | number;
  }) => ({
    flexShrink: 0,
    [theme.breakpoints.down(breakpoint)]: {
      transition: 'transform ease-in-out 225ms',
      background: theme.palette.common.white,
      position: 'absolute',
      zIndex: 1,
    },
  }),
);

const LeftPanelWrapper = styled(PanelWrapper)(
  ({
    theme,
    breakpoint,
    open,
  }: {
    theme: Theme;
    open: boolean;
    breakpoint: Breakpoint | number;
  }) => ({
    borderRight: `1px solid ${theme.palette.cruGrayLight.main}`,
    left: 0,
    [theme.breakpoints.down(breakpoint)]: {
      transform: open ? 'none' : 'translate(-100%)',
    },
  }),
);
const RightPanelWrapper = styled(PanelWrapper)(
  ({
    theme,
    breakpoint,
    open,
  }: {
    theme: Theme;
    open: boolean;
    breakpoint: Breakpoint | number;
  }) => ({
    borderLeft: `1px solid ${theme.palette.cruGrayLight.main}`,
    right: 0,
    [theme.breakpoints.down(breakpoint)]: {
      transform: open ? 'none' : 'translate(100%)',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  }),
);

interface SidePanelsLayoutProps {
  leftPanel: ReactElement;
  leftWidth: string;
  leftOpen: boolean;
  mainContent: ReactElement;
  rightPanel: ReactElement;
  rightWidth: string;
  rightOpen: boolean;
}

export const SidePanelsLayout: FC<SidePanelsLayoutProps> = ({
  leftPanel,
  leftWidth,
  leftOpen,
  mainContent,
  rightPanel,
  rightWidth,
  rightOpen,
}) => (
  <CollapsibleWrapper justifyContent="flex-start">
    <ExpandingContent open={rightOpen}>
      <CollapsibleWrapper justifyContent="flex-end">
        <LeftPanelWrapper
          open={leftOpen}
          width={leftWidth}
          flexBasis={leftWidth}
          breakpoint="sm"
        >
          {leftPanel}
        </LeftPanelWrapper>
        <ExpandingContent open={leftOpen}>
          <ScrollBox>{mainContent}</ScrollBox>
        </ExpandingContent>
      </CollapsibleWrapper>
    </ExpandingContent>
    <RightPanelWrapper
      open={rightOpen}
      width={rightWidth}
      flexBasis={rightWidth}
      breakpoint="md"
    >
      {rightPanel}
    </RightPanelWrapper>
  </CollapsibleWrapper>
);
