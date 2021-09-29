import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, styled, Theme, Typography } from '@material-ui/core';
import { FilterList } from '@material-ui/icons';

interface AccountsListHeaderProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  totalBalance?: string | undefined;
}

const StickyHeader = styled(Box)(({}) => ({
  position: 'sticky',
  top: 0,
  height: 96,
}));

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

export const AccountsListHeader: FC<AccountsListHeaderProps> = ({
  title,
  isNavListOpen,
  onNavListToggle,
  totalBalance,
}) => {
  const { t } = useTranslation();

  return (
    <StickyHeader p={2} test-dataid="AccountsListHeader">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <NavListButton panelOpen={isNavListOpen} onClick={onNavListToggle}>
            <NavListIcon titleAccess={t('Toggle Filter Panel')} />
          </NavListButton>
          <HeaderTitle variant="h5">{title}</HeaderTitle>
        </Box>
        {totalBalance && (
          <HeaderTitle variant="h6">{`${t(
            'Balance',
          )}: ${totalBalance}`}</HeaderTitle>
        )}
      </Box>
    </StickyHeader>
  );
};
