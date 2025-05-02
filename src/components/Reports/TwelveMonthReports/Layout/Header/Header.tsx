import React, { FC } from 'react';
import FilterList from '@mui/icons-material/FilterList';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { TwelveMonthReportCurrencyType } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { TwelveMonthReportActions } from './Actions/Actions';

interface TwelveMonthReportHeaderProps {
  csvData: (string | number)[][];
  currencyType: TwelveMonthReportCurrencyType;
  isExpanded: boolean;
  isMobile: boolean;
  isNavListOpen: boolean;
  onExpandToggle: () => void;
  onNavListToggle: () => void;
  onPrint: (event: React.MouseEvent<unknown>) => void;
  title: string;
}

const StickyHeader = styled(Box)(({}) => ({
  position: 'sticky',
  top: 0,
  height: 96,
  '@media print': {
    position: 'static',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    height: 'auto',
  },
}));

const HeaderTitle = styled(Typography)(({}) => ({
  lineHeight: 1.1,
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
  '@media print': {
    display: 'none',
  },
}));

const NavListIcon = styled(FilterList)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));

const StyledGrid = styled(Grid)(() => ({
  '@media print': {
    display: 'none',
  },
}));

export const TwelveMonthReportHeader: FC<TwelveMonthReportHeaderProps> = ({
  csvData,
  currencyType,
  title,
  isExpanded,
  isMobile,
  isNavListOpen,
  onExpandToggle,
  onNavListToggle,
  onPrint,
  ...rest
}) => {
  const { t } = useTranslation();

  return (
    <StickyHeader p={2} data-testid="TwelveMonthReportHeader">
      <Grid
        container
        justifyContent={isMobile ? 'center' : 'space-between'}
        spacing={2}
        {...rest}
      >
        <Grid item>
          <Box display="flex" alignItems="center">
            <NavListButton panelOpen={isNavListOpen} onClick={onNavListToggle}>
              <NavListIcon titleAccess={t('Toggle Filter Panel')} />
            </NavListButton>
            <HeaderTitle variant="h5">{title}</HeaderTitle>
          </Box>
        </Grid>
        <StyledGrid item>
          <TwelveMonthReportActions
            csvData={csvData}
            currencyType={currencyType}
            isExpanded={isExpanded}
            isMobile={isMobile}
            onExpandToggle={onExpandToggle}
            onPrint={onPrint}
          />
        </StyledGrid>
      </Grid>
    </StickyHeader>
  );
};
