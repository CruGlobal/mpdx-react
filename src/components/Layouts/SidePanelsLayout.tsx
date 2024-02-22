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

type FullHeightBoxProps = {
  isScrollable?: boolean;
  headerHeight: number | string;
};

const FullHeightBox = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'headerHeight' && prop !== 'isScrollable',
})<FullHeightBoxProps>(({ theme, headerHeight, isScrollable = false }) => {
  const toolbar = theme.mixins.toolbar as ToolbarMixin;
  return {
    height: `calc(100vh - ${toolbar.minHeight}px - ${headerHeight})`,
    ['@media (min-width:0px) and (orientation: landscape)']: {
      height: `calc(100vh - ${toolbar['@media (min-width:0px)']['@media (orientation: landscape)'].minHeight}px - ${headerHeight})`,
    },
    ['@media (min-width:600px)']: {
      height: `calc(100vh - ${toolbar['@media (min-width:600px)'].minHeight}px - ${headerHeight})`,
    },
    overflowY: isScrollable ? 'auto' : 'hidden',
  };
});

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

const LeftPanelWrapper = styled(FullHeightBox)(({ theme }) => ({
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

const RightPanelWrapper = styled(FullHeightBox)(({ theme, headerHeight }) => {
  const toolbar = theme.mixins.toolbar as ToolbarMixin;
  return {
    position: 'fixed',
    zIndex: 20,
    right: 0,
    transition: 'transform ease-in-out 225ms',
    overflowY: 'scroll',
    background: theme.palette.common.white,
    top: `calc(${toolbar.minHeight}px + ${headerHeight})`,
    ['@media (min-width:0px) and (orientation: landscape)']: {
      top: `calc(${toolbar['@media (min-width:0px)']['@media (orientation: landscape)'].minHeight}px + ${headerHeight})`,
    },
    ['@media (min-width:600px)']: {
      top: `calc(${toolbar['@media (min-width:600px)'].minHeight}px + ${headerHeight})`,
      borderLeft: `1px solid ${theme.palette.cruGrayLight.main}`,
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  };
});

interface SidePanelsLayoutProps {
  isScrollBox?: boolean;
  leftPanel?: ReactElement;
  leftWidth: string;
  leftOpen: boolean;
  mainContent: ReactElement;
  rightPanel?: ReactElement;
  rightWidth?: string;
  rightOpen?: boolean;

  // The height of any extra header that the right panel should be under, not including the root navbar
  headerHeight?: number | string;
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
  headerHeight = '0px',
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
            headerHeight="0px"
            isScrollable={isScrollBox}
            style={{ transform: leftOpen ? 'none' : 'translate(-100%)' }}
            data-testid="SidePanelsLayoutLeftPanel"
          >
            {leftPanel}
          </LeftPanelWrapper>
          <ExpandingContent open={leftOpen}>{mainContent}</ExpandingContent>
        </CollapsibleWrapper>
      </ExpandingContent>
      <RightPanelWrapper
        width={isMobile ? '100%' : rightWidth}
        headerHeight={headerHeight}
        isScrollable
        style={{
          transform: rightOpen ? 'none' : 'translate(100%)',
        }}
      >
        {rightPanel}
      </RightPanelWrapper>
    </OuterWrapper>
  );
};
