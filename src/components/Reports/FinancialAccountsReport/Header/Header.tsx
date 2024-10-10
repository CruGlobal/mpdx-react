import NextLink from 'next/link';
import React, { useContext } from 'react';
import { ChevronLeft, FilterList, Menu } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { FilterButton } from 'src/components/Shared/Header/styledComponents';
import { SearchBox } from 'src/components/common/SearchBox/SearchBox';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { formatNumber } from '../AccountSummary/AccountSummaryHelper';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';

const StickyHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'onTransactionPage',
})<{ onTransactionPage?: boolean }>(({ theme, onTransactionPage }) => ({
  backgroundColor: theme.palette.common.white,
  position: 'sticky',
  top: 0,
  height: onTransactionPage ? 185 : 96,
  '@media print': {
    paddingTop: '0',
  },
  zIndex: 500,
}));

const GoBackAction = styled(Box)(() => ({
  width: '50px',
}));

const HeaderFilterAction = styled(Box)(() => ({
  width: '50px',
}));
const HeaderTitle = styled(Typography)(({}) => ({
  lineHeight: 1.1,
}));
const MenuIcon = styled(Menu)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));
const FilterIcon = styled(FilterList)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));
const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: theme.spacing(2),
}));
const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  width: 'calc(100% - 150px)',
}));

interface FinancialAccountHeaderProps {
  onTransactionPage?: boolean;
  disableExportCSV?: boolean;
  handleExportCSV?: () => void;
}
export const FinancialAccountHeader: React.FC<FinancialAccountHeaderProps> = ({
  onTransactionPage = false,
  disableExportCSV = false,
  handleExportCSV,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const {
    accountListId,
    financialAccountId,
    financialAccountsQuery,
    handleNavListToggle,
    hasActiveFilters,
    handleFilterListToggle,
    searchTerm,
    setSearchTerm,
  } = useContext(FinancialAccountContext) as FinancialAccountType;

  const financialAccount = financialAccountsQuery.data?.financialAccount;

  const handleSearchTermChange = (search: string) => {
    setSearchTerm(search);
  };

  return (
    <StickyHeader p={2} data-testid="FinancialAccountHeader" onTransactionPage>
      {financialAccount && (
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          pb={1}
        >
          <Grid item>
            <Box display="flex" alignItems="center">
              <GoBackAction>
                <NextLink
                  href={`/accountLists/${accountListId}/reports/financialAccounts/`}
                  passHref
                  shallow
                >
                  <Link>
                    <IconButton sx={{ marginRight: 2 }} color="primary">
                      <ChevronLeft
                        titleAccess={t('Go Back to financial Accounts')}
                      />
                    </IconButton>
                  </Link>
                </NextLink>
              </GoBackAction>

              <HeaderFilterAction>
                <IconButton
                  sx={{ marginRight: 2 }}
                  onClick={handleNavListToggle}
                >
                  <MenuIcon titleAccess={t('Toggle Menu Panel')} />
                </IconButton>
              </HeaderFilterAction>
              <Box display="flex" width="100%">
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexGrow={1}
                >
                  <Box display="flex" flexDirection="column">
                    <Typography variant="h5">
                      {financialAccount.name}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      {`${financialAccount.code ?? ''} - ${
                        financialAccount.organization?.name
                      }`}
                    </Typography>
                    {financialAccountId && (
                      <Box display="flex" gap={0.5}>
                        <NextLink
                          href={`/accountLists/${accountListId}/reports/financialAccounts/${financialAccountId}`}
                          passHref
                          shallow
                        >
                          <Link underline="hover">{t('Summary')}</Link>
                        </NextLink>
                        {' · '}
                        <NextLink
                          href={`/accountLists/${accountListId}/reports/financialAccounts/${financialAccountId}/entries`}
                          passHref
                          shallow
                        >
                          <Link underline="hover">{t('Transactions')}</Link>
                        </NextLink>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item>
            <HeaderTitle variant="h5">
              {currencyFormat(
                formatNumber(financialAccount.balance.convertedAmount),
                financialAccount.balance.convertedCurrency,
                locale,
              )}
            </HeaderTitle>
          </Grid>
        </Grid>
      )}
      <Divider />
      {onTransactionPage && (
        <Header>
          <HeaderFilterAction>
            <FilterButton
              activeFilters={hasActiveFilters}
              onClick={handleFilterListToggle}
            >
              <FilterIcon titleAccess={t('Toggle Filter Panel')} />
            </FilterButton>
          </HeaderFilterAction>
          <HeaderActions>
            {handleExportCSV && (
              <Button
                size="large"
                variant="contained"
                onClick={handleExportCSV}
                disabled={disableExportCSV}
                sx={{
                  paddingBottom: '11px',
                  paddingTop: '11px',
                }}
              >
                {t('Export CSV')}
              </Button>
            )}

            <SearchBox
              showContactSearchIcon={false}
              searchTerm={searchTerm}
              onChange={handleSearchTermChange}
              placeholder={t(
                'Search by description, code, category name, category code',
              )}
              toolTipText={t(
                'Search by description, code, category name, category code',
              )}
            />
          </HeaderActions>
        </Header>
      )}
    </StickyHeader>
  );
};
