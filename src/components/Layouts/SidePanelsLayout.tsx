import { FC, ReactElement } from 'react';
import { Box, styled, Theme, useMediaQuery } from '@material-ui/core';
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints';

type ScrollBoxProps = {
  isscroll?: 1 | 0;
};

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

const ScrollBox = styled(FullHeightBox)(({ isscroll }: ScrollBoxProps) => ({
  overflowY: isscroll === 1 ? 'auto' : 'hidden',
}));

const OuterWrapper = styled(Box)({
  position: 'relative',
  overflowX: 'hidden',
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
    position: 'relative',
    zIndex: 10,
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
const RightPanelWrapper = styled(ScrollBox)(
  ({ theme, open }: { theme: Theme; open: boolean }) => ({
    position: 'absolute',
    zIndex: 20,
    top: 0,
    right: 0,
    transform: open ? 'none' : 'translate(100%)',
    transition: 'transform ease-in-out 225ms',
    background: theme.palette.common.white,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    [theme.breakpoints.up('md')]: {
      borderLeft: `1px solid ${theme.palette.cruGrayLight.main}`,
    },
  }),
);

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
            open={leftOpen}
            width={leftWidth}
            flexBasis={leftWidth}
            breakpoint="sm"
          >
            <ScrollBox isscroll={isScrollBox ? 1 : 0}>{leftPanel}</ScrollBox>
          </LeftPanelWrapper>
          <ExpandingContent open={leftOpen}>{mainContent}</ExpandingContent>
        </CollapsibleWrapper>
      </ExpandingContent>
      <RightPanelWrapper
        open={rightOpen}
        width={isMobile ? '100%' : rightWidth}
      >
        <ScrollBox isscroll={isScrollBox ? 1 : 0}>{rightPanel}</ScrollBox>
      </RightPanelWrapper>
    </OuterWrapper>
  );
};
