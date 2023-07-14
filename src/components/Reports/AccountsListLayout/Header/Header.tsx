import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';
import FilterList from '@mui/icons-material/FilterList';

interface AccountsListHeaderProps {
  showNavListButton?: boolean;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  rightExtra?: ReactNode;
}

const StickyHeader = styled(Box)(({}) => ({
  position: 'sticky',
  top: 0,
}));

const NavListButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'panelOpen',
})(({ panelOpen }: { panelOpen: boolean }) => ({
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
  rightExtra,
  isNavListOpen,
  onNavListToggle,
  showNavListButton = true,
}) => {
  const { t } = useTranslation();

  return (
    <StickyHeader p={2} test-dataid="AccountsListHeader">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ lineHeight: 1.1 }}
      >
        {showNavListButton && (
          <NavListButton panelOpen={isNavListOpen} onClick={onNavListToggle}>
            <NavListIcon titleAccess={t('Toggle Filter Panel')} />
          </NavListButton>
        )}
        <Typography variant="h5" sx={{ flex: 1 }}>
          {title}
        </Typography>
        {rightExtra}
      </Box>
    </StickyHeader>
  );
};
