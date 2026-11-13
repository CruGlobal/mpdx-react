import React, { FC, ReactNode, useEffect, useRef } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import { NavFilterIcon } from '../styledComponents/NavFilterIcon';
import { getHeaderTitleAccess } from './helpers';

export enum HeaderTypeEnum {
  Report = 'reports',
  HrTools = 'hrTools',
  Filters = 'filters',
  Settings = 'settings',
  MpdxTools = 'mpdxTools',
}

const baseHeaderHeight = theme.spacing(10);
const headerHeightVariable = '--multi-page-header-height';

/**
 * The header's height, for calc() heights of the content under it. On phones the header grows
 * when the title wraps or the extras need their own row, and it keeps this value up to date.
 */
export const multiPageHeaderHeight = `var(${headerHeightVariable}, ${baseHeaderHeight})`;

interface MultiPageHeaderProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  headerType: HeaderTypeEnum;
  /** Shown just after the title, e.g. how fresh the page's data is. */
  titleExtra?: ReactNode;
  rightExtra?: ReactNode;
}

export const StickyHeader = styled(Box)(() => ({
  position: 'sticky',
  top: 0,
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.grey[200],
  height: baseHeaderHeight,
  zIndex: '700',
  background: theme.palette.common.white,
  '@media print': {
    display: 'none',
  },
}));

export const NavListButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'panelOpen',
})(({ panelOpen }: { panelOpen: boolean }) => ({
  display: 'inline-block',
  width: 48,
  height: 48,
  borderradius: 24,
  margin: theme.spacing(0),
  backgroundColor: panelOpen ? theme.palette.secondary.dark : 'transparent',
  marginRight: '8px',
  padding: '11px',
}));

export const NavMenuIcon = styled(MenuIcon)(() => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));

export const MultiPageHeader: FC<MultiPageHeaderProps> = ({
  title,
  titleExtra,
  rightExtra,
  isNavListOpen,
  onNavListToggle,
  headerType,
}) => {
  const { t } = useTranslation();
  const { onSetupTour } = useSetupContext();
  const isReportsHeader = headerType === HeaderTypeEnum.Report;
  const isHrToolsHeader = headerType === HeaderTypeEnum.HrTools;
  const isSettingsHeader = headerType === HeaderTypeEnum.Settings;
  const isToolsHeader = headerType === HeaderTypeEnum.MpdxTools;
  const isFiltersHeader = headerType === HeaderTypeEnum.Filters;

  const titleAccess = getHeaderTitleAccess(headerType, t);

  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof ResizeObserver === 'undefined') {
      return;
    }

    const rootStyle = document.documentElement.style;
    const observer = new ResizeObserver(() => {
      rootStyle.setProperty(headerHeightVariable, `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => {
      observer.disconnect();
      rootStyle.removeProperty(headerHeightVariable);
    };
  }, []);

  return (
    <StickyHeader
      ref={headerRef}
      p={2}
      test-dataid="MultiPageHeader"
      sx={{ [theme.breakpoints.down('sm')]: { height: 'auto' } }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          lineHeight: 1.1,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          rowGap: 1,
        }}
      >
        <NavListButton
          panelOpen={isNavListOpen}
          onClick={onNavListToggle}
          disabled={onSetupTour && isSettingsHeader}
        >
          {isReportsHeader && (
            <NavMenuIcon
              titleAccess={titleAccess}
              data-testid="ReportsMenuIcon"
            />
          )}
          {isHrToolsHeader && (
            <NavMenuIcon
              titleAccess={titleAccess}
              data-testid="HrToolsMenuIcon"
            />
          )}
          {isFiltersHeader && (
            <NavFilterIcon titleAccess={titleAccess} data-testid="FilterIcon" />
          )}
          {!onSetupTour && isSettingsHeader && (
            <NavMenuIcon
              titleAccess={titleAccess}
              data-testid="SettingsMenuIcon"
            />
          )}
          {isToolsHeader && (
            <NavMenuIcon
              titleAccess={titleAccess}
              data-testid="MpdxToolsMenuIcon"
            />
          )}
        </NavListButton>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              // The h6 size fits most titles on one line on phones, and a
              // longer one wraps instead of being cut off
              [theme.breakpoints.down('sm')]: {
                fontSize: theme.typography.h6.fontSize,
              },
            }}
          >
            {title}
          </Typography>
          {titleExtra}
        </Box>
        {rightExtra && (
          <Box
            sx={{
              // Lays out as if unwrapped, except on phones, where the extras
              // get their own row, lined up with the title past the menu button
              display: 'contents',
              [theme.breakpoints.down('sm')]: {
                display: 'flex',
                alignItems: 'center',
                flexBasis: '100%',
                paddingLeft: theme.spacing(7),
                '&:empty': { display: 'none' },
              },
            }}
          >
            {rightExtra}
          </Box>
        )}
      </Box>
    </StickyHeader>
  );
};
