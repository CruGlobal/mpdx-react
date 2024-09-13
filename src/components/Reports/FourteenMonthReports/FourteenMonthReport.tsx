import React, { useMemo, useState } from 'react';
import { Box, CircularProgress, useMediaQuery } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { FourteenMonthReportCurrencyType } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useFourteenMonthReportQuery } from './GetFourteenMonthReport.generated';
import { FourteenMonthReportHeader as Header } from './Layout/Header/Header';
import {
  FourteenMonthReportTable as Table,
  FourteenMonthReportTableProps as TableProps,
} from './Layout/Table/Table';
import { calculateTotals, sortContacts } from './Layout/Table/helpers';
import type { Order } from '../Reports.type';
import type { OrderBy } from './Layout/Table/TableHead/TableHead';

interface CurrencyTable extends Pick<TableProps, 'totals' | 'orderedContacts'> {
  currency: string;
}

interface Props {
  accountListId: string;
  designationAccounts?: string[];
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
  currencyType: FourteenMonthReportCurrencyType;
  onSelectContact: (contactId: string) => void;
}

export interface MonthTotal {
  total: number;
  month: string;
}

export const FourteenMonthReport: React.FC<Props> = ({
  accountListId,
  designationAccounts,
  currencyType,
  isNavListOpen,
  title,
  onSelectContact,
  onNavListToggle,
}) => {
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy | null>(null);
  const { t } = useTranslation();
  const locale = useLocale();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const apiConstants = useApiConstants();

  const { data, error } = useFourteenMonthReportQuery({
    variables: {
      accountListId,
      designationAccountIds: designationAccounts?.length
        ? designationAccounts
        : null,
      currencyType,
    },
  });

  // Generate a table for each currency group in the report
  const currencyTables = useMemo<CurrencyTable[]>(
    () =>
      data?.fourteenMonthReport.currencyGroups.map((currencyGroup) => ({
        currency: currencyGroup.currency,
        orderedContacts: sortContacts(currencyGroup.contacts, orderBy, order),
        totals: calculateTotals(currencyGroup.contacts),
      })) ?? [],
    [data, orderBy, order],
  );

  const handleExpandToggle = (): void => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  const handlePrint = () => window.print();

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: OrderBy,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const formatMonth = (month: string) =>
    DateTime.fromISO(month).toJSDate().toLocaleDateString(locale, {
      month: 'numeric',
      year: '2-digit',
    });

  // If there are multiple tables, concatenate them all together
  const csvData = useMemo(
    () =>
      currencyTables.flatMap(({ currency, orderedContacts, totals }) => {
        // Each table starts with two rows of headers
        const csvHeaders = [
          [t('Currency'), currency],
          [
            t('Partner'),
            t('Status'),
            t('Commitment Amount'),
            t('Commitment Currency'),
            t('Commitment Frequency'),
            t('Committed Monthly Equivalent'),
            t('In Hand Monthly Equivalent'),
            t('Missing In Hand Monthly Equivalent'),
            t('In Hand Special Gifts'),
            t('In Hand Date Range'),
            ...totals.map(({ month }) => month),
            t('Total (last month excluded from total)'),
          ],
        ];

        // Then one row for each contact
        const csvBody = orderedContacts.map((contact) => {
          const numMonthsForMonthlyEquivalent = Math.max(
            4,
            parseInt(contact.pledgeFrequency ?? '4'),
          );

          const pledgedMonthlyEquivalent =
            contact.status === 'Partner - Financial' &&
            contact.pledgeAmount &&
            contact.pledgeFrequency
              ? Math.round(
                  contact.pledgeAmount / parseFloat(contact.pledgeFrequency),
                )
              : '';

          const inHandMonths = contact.months?.slice(
            15 - numMonthsForMonthlyEquivalent - 1,
            15 - 1,
          );

          const inHandMonthlyEquivalent =
            contact.status === 'Partner - Financial' &&
            contact.pledgeFrequency &&
            inHandMonths
              ? Math.round(
                  inHandMonths.reduce((sum, month) => sum + month.total, 0) /
                    numMonthsForMonthlyEquivalent,
                )
              : '';

          const inHandDateRange =
            inHandMonths && inHandMonthlyEquivalent
              ? `${formatMonth(inHandMonths[0].month)} - ${formatMonth(
                  inHandMonths[inHandMonths.length - 1].month,
                )}`
              : '';

          return [
            contact.name,
            contact.status ?? '',
            contact.pledgeAmount ?? '',
            contact.pledgeCurrency ?? '',
            apiConstants?.pledgeFrequency?.find(
              ({ key }) => key === contact.pledgeFrequency,
            )?.value ?? '',
            pledgedMonthlyEquivalent,
            inHandMonthlyEquivalent !== '' && pledgedMonthlyEquivalent !== ''
              ? Math.min(pledgedMonthlyEquivalent, inHandMonthlyEquivalent)
              : '',
            inHandMonthlyEquivalent !== '' && pledgedMonthlyEquivalent !== ''
              ? -Math.max(0, pledgedMonthlyEquivalent - inHandMonthlyEquivalent)
              : '',
            inHandMonthlyEquivalent !== '' && pledgedMonthlyEquivalent !== ''
              ? Math.max(
                  0,
                  inHandMonthlyEquivalent - pledgedMonthlyEquivalent,
                ) * numMonthsForMonthlyEquivalent
              : Math.round(contact.total),
            inHandDateRange,
            ...(contact.months?.map((month) => Math.round(month.total)) || []),
            Math.round(contact.total),
          ];
        });

        const roundedTotals = totals.map(({ total }) => Math.round(total));

        // Then one row of totals
        const csvTotals = [
          t('Totals'),
          '',
          '',
          '',
          '',
          csvBody.reduce(
            (sum, row) => sum + (typeof row[5] === 'number' ? row[5] : 0),
            0,
          ),
          csvBody.reduce(
            (sum, row) => sum + (typeof row[6] === 'number' ? row[6] : 0),
            0,
          ),
          csvBody.reduce(
            (sum, row) => sum + (typeof row[7] === 'number' ? row[7] : 0),
            0,
          ),
          csvBody.reduce(
            (sum, row) => sum + (typeof row[8] === 'number' ? row[8] : 0),
            0,
          ),
          '',
          ...roundedTotals,
          roundedTotals.reduce((sum, monthTotal) => sum + monthTotal, 0),
        ];

        return [...csvHeaders, ...csvBody, csvTotals];
      }),
    [currencyTables, apiConstants],
  );

  return (
    <Box>
      <Header
        csvData={csvData}
        currencyType={currencyType}
        isExpanded={isExpanded}
        isMobile={isMobile}
        isNavListOpen={isNavListOpen}
        onExpandToggle={handleExpandToggle}
        onNavListToggle={onNavListToggle}
        onPrint={handlePrint}
        title={title}
      />
      {!data && !error ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingFourteenMonthReport" />
        </Box>
      ) : error ? (
        <Notification type="error" message={error.toString()} />
      ) : currencyTables.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={4}>
          {currencyTables.map(({ currency, orderedContacts, totals }) => (
            <Table
              key={currency}
              isExpanded={isExpanded}
              onSelectContact={onSelectContact}
              onRequestSort={handleRequestSort}
              order={order}
              orderBy={orderBy}
              orderedContacts={orderedContacts}
              salaryCurrency={currency}
              totals={totals}
            />
          ))}
        </Box>
      ) : (
        <EmptyReport
          title={t(
            'You have received no donations in the last thirteen months',
          )}
          subTitle={t(
            'You can setup an organization account to import them or add a new donation.',
          )}
        />
      )}
    </Box>
  );
};
