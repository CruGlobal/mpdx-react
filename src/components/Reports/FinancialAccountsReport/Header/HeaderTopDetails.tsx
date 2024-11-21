import NextLink from 'next/link';
import React from 'react';
import { ChevronLeft, Menu } from '@mui/icons-material';
import { Box, Grid, IconButton, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { formatNumber } from '../AccountSummary/AccountSummaryHelper';
import { useFinancialAccountQuery } from '../Context/FinancialAccount.generated';

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

interface HeaderTopDetailsProps {
  accountListId: string;
  financialAccountId: string;
  handleNavListToggle: () => void;
}
export const HeaderTopDetails: React.FC<HeaderTopDetailsProps> = ({
  accountListId,
  financialAccountId,
  handleNavListToggle,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data } = useFinancialAccountQuery({
    variables: {
      accountListId,
      financialAccountId,
    },
  });

  const financialAccount = data?.financialAccount;

  return financialAccount ? (
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
            <Link
              component={NextLink}
              href={`/accountLists/${accountListId}/reports/financialAccounts/`}
              shallow
            >
              <IconButton sx={{ marginRight: 2 }} color="primary">
                <ChevronLeft titleAccess={t('Go Back to financial Accounts')} />
              </IconButton>
            </Link>
          </GoBackAction>

          <HeaderFilterAction>
            <IconButton sx={{ marginRight: 2 }} onClick={handleNavListToggle}>
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
                <Typography variant="h5">{financialAccount.name}</Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {`${financialAccount.code ?? ''} - ${
                    financialAccount.organization?.name
                  }`}
                </Typography>
                {financialAccountId && (
                  <Box display="flex" gap={0.5}>
                    <Link
                      component={NextLink}
                      href={`/accountLists/${accountListId}/reports/financialAccounts/${financialAccountId}`}
                      shallow
                    >
                      {t('Summary')}
                    </Link>
                    {' · '}
                    <Link
                      component={NextLink}
                      href={`/accountLists/${accountListId}/reports/financialAccounts/${financialAccountId}/entries`}
                      shallow
                    >
                      {t('Transactions')}
                    </Link>
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
  ) : null;
};
