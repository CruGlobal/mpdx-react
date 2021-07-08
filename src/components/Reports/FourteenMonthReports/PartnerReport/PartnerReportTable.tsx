/* eslint-disable import/no-unresolved */
import React from 'react';
import {
  Box,
  Grid,
  IconButton,
  styled,
  Table,
  TableContainer,
  Theme,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
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
    backgroundColor:
      panelopen === 1 ? theme.palette.secondary.dark : 'transparent',
  }),
);

const NavListIcon = styled(FilterList)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));

export const PartnerReportTable: React.FC<Props> = ({
  accountListId,
  isNavListOpen,
  title,
  onNavListToggle,
  ...rest
}) => {
  const { t } = useTranslation();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  return (
    <Box>
      <StickyHeader p={2}>
        <Grid
          container
          justify={isMobile ? 'center' : 'space-between'}
          spacing={2}
          {...rest}
        >
          <Grid item>
            <Box display="flex" alignItems="center">
              <NavListButton
                panelopen={isNavListOpen ? 1 : 0}
                onClick={onNavListToggle}
              >
                <NavListIcon titleAccess={t('Toggle Filter Panel')} />
              </NavListButton>
              <HeaderTitle variant="h5">{t(title)}</HeaderTitle>
            </Box>
          </Grid>
          <Grid item></Grid>
        </Grid>
      </StickyHeader>
      {accountListId && (
        <TableContainer>
          <Table></Table>
        </TableContainer>
      )}
    </Box>
  );
};
