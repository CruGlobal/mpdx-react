import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, styled, Theme, Typography } from '@material-ui/core';
import { FilterList } from '@material-ui/icons';

interface DesignationAccountsReportHeaderProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

const HeaderTitle = styled(Typography)(({}) => ({
  lineHeight: 1.1,
}));

const NavListButton = styled(({ panelOpen: _panelOpen, ...props }) => (
  <IconButton {...props} />
))(({ theme, panelOpen }: { theme: Theme; panelOpen: boolean }) => ({
  display: 'inline-block',
  width: 48,
  height: 48,
  borderradius: 24,
  margin: theme.spacing(1),
  backgroundColor: panelOpen ? theme.palette.secondary.dark : 'transparent',
}));

const NavListIcon = styled(FilterList)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));

export const DesignationAccountsHeader: FC<DesignationAccountsReportHeaderProps> = ({
  title,
  isNavListOpen,
  onNavListToggle,
}) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" alignItems="center">
      <NavListButton panelOpen={isNavListOpen} onClick={onNavListToggle}>
        <NavListIcon titleAccess={t('Toggle Filter Panel')} />
      </NavListButton>
      <HeaderTitle variant="h5">{title}</HeaderTitle>
    </Box>
  );
};
