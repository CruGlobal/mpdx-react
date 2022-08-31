import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  IconButton,
  styled,
  Theme,
  Typography,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { FourteenMonthReportCurrencyType } from '../../../../../../graphql/types.generated';
import { FourteenMonthReportActions } from './Actions/Actions';

interface FourteenMonthReportHeaderProps {
  csvData: ((string | undefined)[] | (string | number)[])[];
  currencyType: FourteenMonthReportCurrencyType;
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

export const FourteenMonthReportHeader: FC<FourteenMonthReportHeaderProps> = ({
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
    <StickyHeader p={2} data-testid="FourteenMonthReportHeader">
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
        <Grid item>
          <FourteenMonthReportActions
            csvData={csvData}
            currencyType={currencyType}
            isExpanded={isExpanded}
            isMobile={isMobile}
            onExpandToggle={onExpandToggle}
            onPrint={onPrint}
          />
        </Grid>
      </Grid>
    </StickyHeader>
  );
};
