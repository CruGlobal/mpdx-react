import React, { FC, ReactNode } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import { NavFilterIcon } from '../styledComponents/NavFilterIcon';

export enum HeaderTypeEnum {
  Report = 'reports',
  Filters = 'filters',
  Settings = 'settings',
  Tools = 'tools',
}

export const multiPageHeaderHeight = theme.spacing(10);

interface MultiPageHeaderProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  headerType: HeaderTypeEnum;
  rightExtra?: ReactNode;
}

const StickyHeader = styled(Box)(() => ({
  position: 'sticky',
  top: 0,
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.grey[200],
  height: multiPageHeaderHeight,
  zIndex: '700',
  background: theme.palette.common.white,
}));

const NavListButton = styled(IconButton, {
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

const NavMenuIcon = styled(MenuIcon)(() => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));

export const MultiPageHeader: FC<MultiPageHeaderProps> = ({
  title,
  rightExtra,
  isNavListOpen,
  onNavListToggle,
  headerType,
}) => {
  const { t } = useTranslation();
  const { onSetupTour } = useSetupContext();
  const isReportsHeader = headerType === HeaderTypeEnum.Report;
  const isSettingsHeader = headerType === HeaderTypeEnum.Settings;
  const isToolsHeader = headerType === HeaderTypeEnum.Tools;
  const isFiltersHeader = headerType === HeaderTypeEnum.Filters;

  let titleAccess;
  if (isReportsHeader) {
    titleAccess = t('Toggle Navigation Panel');
  } else if (isFiltersHeader) {
    titleAccess = t('Toggle Filters Panel');
  } else if (isSettingsHeader) {
    titleAccess = t('Toggle Preferences Menu');
  } else if (isToolsHeader) {
    titleAccess = t('Toggle Tools Menu');
  }

  return (
    <StickyHeader p={2} test-dataid="MultiPageHeader">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ lineHeight: 1.1 }}
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
              data-testid="ToolsMenuIcon"
            />
          )}
        </NavListButton>
        <Typography variant="h5" sx={{ flex: 1 }}>
          {title}
        </Typography>
        {rightExtra}
      </Box>
    </StickyHeader>
  );
};
