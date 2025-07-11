import React, { FC, ReactNode } from 'react';
import FilterList from '@mui/icons-material/FilterList';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';

export enum HeaderTypeEnum {
  Report = 'reports',
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

const NavFilterIcon = styled(FilterList)(() => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
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

  let titleAccess;
  if (headerType === HeaderTypeEnum.Report) {
    titleAccess = t('Toggle Navigation Panel');
  } else if (headerType === HeaderTypeEnum.Settings) {
    titleAccess = t('Toggle Preferences Menu');
  } else if (headerType === HeaderTypeEnum.Tools) {
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
          disabled={onSetupTour && headerType === HeaderTypeEnum.Settings}
        >
          {headerType === HeaderTypeEnum.Report && (
            <NavFilterIcon
              titleAccess={titleAccess}
              data-testid="ReportsFilterIcon"
            />
          )}
          {!onSetupTour && headerType === HeaderTypeEnum.Settings && (
            <NavMenuIcon
              titleAccess={titleAccess}
              data-testid="SettingsMenuIcon"
            />
          )}
          {headerType === HeaderTypeEnum.Tools && (
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
