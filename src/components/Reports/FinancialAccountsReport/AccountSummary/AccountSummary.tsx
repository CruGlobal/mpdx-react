import React, { useContext, useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Maybe } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat, numberFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';
import { FinancialAccountHeader } from '../Header/Header';
import {
  FinancialAccountCategoriesFragment,
  useFinancialAccountSummaryQuery,
} from './financialAccountSummary.generated';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
}));

interface Periods {
  startDateFormatted: string;
  startDate: string;
  endDate: string;
}

interface Category {
  id: string;
  name: string;
  amounts: number[];
}

export const formatNumber = (
  numberAsString?: string | number | null,
  makeAbsolute = true,
) => {
  const number =
    typeof numberAsString === 'string'
      ? Number(numberAsString)
      : numberAsString ?? 0;
  return Math.ceil(makeAbsolute ? Math.abs(number) : number);
};

export interface AppendCategoryToCategoriesArray {
  categories: Maybe<FinancialAccountCategoriesFragment>[];
  categoryArray: Category[];
  index: number;
}

export const appendCategoryToCategoriesArray = ({
  categories,
  categoryArray,
  index,
}: AppendCategoryToCategoriesArray) => {
  categories.forEach((category) => {
    const id = category?.category?.id ?? '';
    const name = category?.category?.name ?? category?.category?.code ?? '';
    const amount = formatNumber(category?.amount);
    if (index === 0) {
      categoryArray.push({ id, name, amounts: [amount] });
    } else {
      const existingCategory = categoryArray.find((c) => c.id === id);
      if (existingCategory) {
        existingCategory.amounts.push(amount);
      }
    }
  });
};

export const AccountSummary: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { accountListId, financialAccountId } = useContext(
    FinancialAccountContext,
  ) as FinancialAccountType;

  const { data } = useFinancialAccountSummaryQuery({
    variables: {
      accountListId,
      financialAccountId: financialAccountId ?? '',
    },
  });

  const tableData = useMemo(() => {
    const credits: number[] = [];
    const creditsCategories: Category[] = [];
    const closingBalances: number[] = [];
    const debits: number[] = [];
    const debitsCategories: Category[] = [];
    const openingBalances: number[] = [];
    const periods: Periods[] = [];
    const surplus: number[] = [];

    data?.financialAccountSummary.forEach((item, idx) => {
      if (!item) {
        return;
      }

      // Credits
      credits.push(formatNumber(item.credits));

      // Closing Balances
      openingBalances.push(formatNumber(item.openingBalance));

      // Debits
      debits.push(formatNumber(item.debits));

      // Closing Balances
      closingBalances.push(formatNumber(item.closingBalance));

      // Surplus
      /**
       * If the first character of the `item.difference` is '-', it removes the '-' character.
       * Otherwise, it prepends the '-' character to the `item.difference` value.
       */
      const difference =
        item.difference?.[0] === '-'
          ? item.difference.substring(1)
          : `-${item.difference}`;
      surplus.push(formatNumber(difference, false));

      // Periods
      const startDateFormatted = monthYearFormat(
        DateTime.fromISO(item?.startDate ?? '').month,
        DateTime.fromISO(item?.startDate ?? '').year,
        locale,
        false,
      );
      periods.push({
        startDateFormatted:
          idx === data.financialAccountSummary.length - 1
            ? 'Total'
            : startDateFormatted,
        startDate: item?.startDate ?? '',
        endDate: item?.endDate ?? '',
      });

      // Credits Categories
      appendCategoryToCategoriesArray({
        categories: item.creditByCategories,
        categoryArray: creditsCategories,
        index: idx,
      });

      // Debits Categories
      appendCategoryToCategoriesArray({
        categories: item.debitByCategories,
        categoryArray: debitsCategories,
        index: idx,
      });
    });

    return {
      closingBalances,
      credits,
      creditsCategories: creditsCategories.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      debits,
      debitsCategories: debitsCategories.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      openingBalances,
      periods,
      surplus,
    };
  }, [data]);

  return (
    <>
      <FinancialAccountHeader />
      <Divider />
      {!data && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingRC" />
        </Box>
      )}

      {data && (
        <Box pl={2} pr={2}>
          <TableContainer sx={{ marginBottom: 6 }}>
            <Table sx={{ minWidth: 650 }} aria-label="table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">{t('Category')}</Typography>
                  </TableCell>
                  {tableData.periods?.map((period, idx) => {
                    return (
                      <TableCell
                        key={`startDate-${idx}-${period?.startDate}`}
                        align="right"
                      >
                        {period.startDateFormatted}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {/* Opening Balance */}
                <TableRow>
                  <StyledTableCell>
                    <Typography variant="body1">
                      {t('Opening Balance')}
                    </Typography>
                  </StyledTableCell>
                  {tableData.openingBalances?.map((balance, idx) => {
                    return (
                      <StyledTableCell key={`${idx}-${balance}`} align="right">
                        {numberFormat(balance, locale)}
                      </StyledTableCell>
                    );
                  })}
                </TableRow>
                {/* Income header */}
                <TableRow sx={{ background: theme.palette.mpdxGreen.main }}>
                  <StyledTableCell>
                    <Typography variant="body1">{t('Income')}</Typography>
                  </StyledTableCell>
                  {tableData.periods?.map((_, idx) => {
                    return (
                      <StyledTableCell
                        key={`income-${idx}`}
                        align="right"
                      ></StyledTableCell>
                    );
                  })}
                </TableRow>

                {/* Income Categories */}
                {tableData.creditsCategories?.map((category, idx) => {
                  return (
                    <TableRow key={`${idx}-${category.name}`}>
                      <StyledTableCell component="th" scope="row">
                        <Typography variant="body1" width="250px">
                          {category.name}
                        </Typography>
                      </StyledTableCell>

                      {category.amounts.map((amount, idx) => (
                        <StyledTableCell key={`${idx}-${amount}`} align="right">
                          {numberFormat(amount, locale)}
                        </StyledTableCell>
                      ))}
                    </TableRow>
                  );
                })}

                {/* Total Income */}
                <TableRow>
                  <StyledTableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {t('Total Income')}
                    </Typography>
                  </StyledTableCell>
                  {tableData.credits?.map((credit, idx) => {
                    return (
                      <StyledTableCell key={`${idx}-${credit}`} align="right">
                        <Typography fontWeight="bold">
                          {numberFormat(credit, locale)}
                        </Typography>
                      </StyledTableCell>
                    );
                  })}
                </TableRow>

                {/* Expenses header */}
                <TableRow sx={{ background: '#FF7679' }}>
                  <StyledTableCell sx={{ color: theme.palette.common.white }}>
                    <Typography variant="body1">{t('Expenses')}</Typography>
                  </StyledTableCell>
                  {tableData.periods?.map((_, idx) => {
                    return (
                      <StyledTableCell
                        key={`expenses-${idx}`}
                        align="right"
                      ></StyledTableCell>
                    );
                  })}
                </TableRow>

                {/* Expenses Categories */}
                {tableData.debitsCategories?.map((category, idx) => {
                  return (
                    <TableRow key={`${idx}-${category.name}`}>
                      <StyledTableCell component="th" scope="row">
                        <Typography variant="body1" width="250px">
                          {category.name}
                        </Typography>
                      </StyledTableCell>

                      {category.amounts.map((amount, idx) => (
                        <StyledTableCell key={`${idx}-${amount}`} align="right">
                          {numberFormat(amount, locale)}
                        </StyledTableCell>
                      ))}
                    </TableRow>
                  );
                })}

                {/* Total Expenses */}
                <TableRow>
                  <StyledTableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {t('Total Expenses')}
                    </Typography>
                  </StyledTableCell>
                  {tableData.debits?.map((credit, idx) => {
                    return (
                      <StyledTableCell key={`${idx}-${credit}`} align="right">
                        <Typography fontWeight="bold">
                          {numberFormat(credit, locale)}
                        </Typography>
                      </StyledTableCell>
                    );
                  })}
                </TableRow>

                {/* Surplus */}
                <TableRow>
                  <StyledTableCell>
                    <Typography variant="body1" fontStyle="italic">
                      {t('Surplus/Deficit')}
                    </Typography>
                  </StyledTableCell>
                  {tableData.surplus?.map((value, idx) => {
                    return (
                      <StyledTableCell key={`${idx}-${value}`} align="right">
                        <Typography fontStyle="italic">
                          {numberFormat(value, locale)}
                        </Typography>
                      </StyledTableCell>
                    );
                  })}
                </TableRow>

                {/* Closing Balance */}
                <TableRow
                  sx={{ background: theme.palette.action.disabledBackground }}
                >
                  <StyledTableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {t('Balance')}
                    </Typography>
                  </StyledTableCell>
                  {tableData.closingBalances?.map((balance, idx) => {
                    return (
                      <StyledTableCell key={`${idx}-${balance}`} align="right">
                        <Typography fontWeight="bold">
                          {numberFormat(balance, locale)}
                        </Typography>
                      </StyledTableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  );
};
