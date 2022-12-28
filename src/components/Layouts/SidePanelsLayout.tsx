import { FC, ReactElement } from 'react';
import { Box, Theme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CSSProperties } from '@mui/styles';

interface ToolbarMixin extends CSSProperties {
  minHeight: number;
  ['@media (min-width:600px)']: { minHeight: number };
  ['@media (min-width:0px)']: {
    ['@media (orientation: landscape)']: { minHeight: number };
  };
}

type ScrollBoxProps = {
  isScrollable?: boolean;
};

const FullHeightBox = styled(Box)(({ theme }) => {
  const toolbar = theme.mixins.toolbar as ToolbarMixin;
  return {
    height: `calc(100vh - ${toolbar.minHeight}px)`,
    ['@media (min-width:0px) and (orientation: landscape)']: {
      height: `calc(100vh - ${toolbar['@media (min-width:0px)']['@media (orientation: landscape)'].minHeight}px)`,
    },
    ['@media (min-width:600px)']: {
      height: `calc(100vh - ${toolbar['@media (min-width:600px)'].minHeight}px)`,
    },
  };
});

const ScrollBox = styled(FullHeightBox, {
  shouldForwardProp: (prop) => prop !== 'isScrollable',
})(({ isScrollable }: ScrollBoxProps) => ({
  overflowY: isScrollable ? 'auto' : 'hidden',
}));

const OuterWrapper = styled(Box)({
  position: 'relative',
  overflowX: 'hidden',
});

const CollapsibleWrapper = styled(Box)({
  display: 'flex',
  overflowX: 'hidden',
});

const ExpandingContent = styled(Box)(({ open }: { open: boolean }) => ({
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: open ? 0 : '100%',
  transition: 'flex-basis ease-in-out 225ms',
  overflowX: 'hidden',
  position: 'relative',
  zIndex: 10,
}));

const LeftPanelWrapper = styled(ScrollBox)(({ theme }) => ({
  flexShrink: 0,
  borderRight: `1px solid ${theme.palette.cruGrayLight.main}`,
  left: 0,
  background: theme.palette.common.white,
  [theme.breakpoints.down('md')]: {
    transition: 'transform ease-in-out 225ms',
    background: theme.palette.common.white,
    position: 'absolute',
    zIndex: 20,
  },
}));

const RightPanelWrapper = styled(ScrollBox)(({ theme }) => {
  const toolbar = theme.mixins.toolbar as ToolbarMixin;
  return {
    position: 'fixed',
    zIndex: 20,
    right: 0,
    transition: 'transform ease-in-out 225ms',
    overflowY: 'scroll',
    background: theme.palette.common.white,
    top: toolbar.minHeight,
    ['@media (min-width:0px) and (orientation: landscape)']: {
      top: toolbar['@media (min-width:0px)']['@media (orientation: landscape)']
        .minHeight,
    },
    ['@media (min-width:600px)']: {
      top: toolbar['@media (min-width:600px)'].minHeight,
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    [theme.breakpoints.up('md')]: {
      borderLeft: `1px solid ${theme.palette.cruGrayLight.main}`,
    },
  };
});

interface SidePanelsLayoutProps {
  isScrollBox?: boolean;
  leftPanel: ReactElement;
  leftWidth: string;
  leftOpen: boolean;
  mainContent: ReactElement;
  rightPanel?: ReactElement;
  rightWidth?: string;
  rightOpen?: boolean;
}

export const SidePanelsLayout: FC<SidePanelsLayoutProps> = ({
  isScrollBox = true,
  leftPanel,
  leftWidth,
  leftOpen,
  mainContent,
  rightPanel,
  rightWidth,
  rightOpen = false,
}) => {
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  return (
    <OuterWrapper>
      <ExpandingContent open={rightOpen}>
        <CollapsibleWrapper justifyContent="flex-end">
          <LeftPanelWrapper
            width={leftWidth}
            flexBasis={leftWidth}
            style={{ transform: leftOpen ? 'none' : 'translate(-100%)' }}
          >
            <ScrollBox isScrollable={isScrollBox}>{leftPanel}</ScrollBox>
          </LeftPanelWrapper>
          <ExpandingContent open={leftOpen}>{mainContent}</ExpandingContent>
        </CollapsibleWrapper>
      </ExpandingContent>
      <RightPanelWrapper
        width={isMobile ? '100%' : rightWidth}
        style={{ transform: rightOpen ? 'none' : 'translate(100%)' }}
      >
        <ScrollBox isScrollable>{rightPanel}</ScrollBox>
      </RightPanelWrapper>
    </OuterWrapper>
  );
};
