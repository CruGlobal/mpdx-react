import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { useLocale } from 'src/hooks/useLocale';
import type { CurrencyTable } from './FourteenMonthReport';

export type CsvData = (string | number)[][];

const formatMonth = (month: string, locale: string): string =>
  DateTime.fromISO(month).toJSDate().toLocaleDateString(locale, {
    month: 'short',
    year: '2-digit',
  });

/*
 * Return the data for a CSV export of the provided currency tables.
 */
export const useCsvData = (currencyTables: CurrencyTable[]): CsvData => {
  const { t } = useTranslation();
  const locale = useLocale();
  const apiConstants = useApiConstants();

  const csvData = useMemo(
    () =>
      currencyTables.flatMap(({ currency, orderedContacts, totals }) => {
        // Each table starts with two rows of headers
        const csvHeaders = [
          [
            t('Currency'),
            currency,
            apiConstants?.pledgeCurrency?.find(({ code }) => code === currency)
              ?.symbol ?? '',
          ],
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
            ...totals.map(({ month }) => formatMonth(month, locale)),
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

          const inHandMonths = contact.months.slice(
            -numMonthsForMonthlyEquivalent,
          );

          const inHandMonthlyEquivalent =
            contact.status === 'Partner - Financial' && contact.pledgeFrequency
              ? Math.round(
                  inHandMonths.reduce((sum, month) => sum + month.total, 0) /
                    numMonthsForMonthlyEquivalent,
                )
              : '';

          const inHandDateRange = inHandMonthlyEquivalent
            ? `${formatMonth(
                inHandMonths[inHandMonths.length - 1].month,
                locale,
              )} - ${formatMonth(inHandMonths[0].month, locale)}`
            : '';

          return [
            contact.name,
            contact.status ?? '',
            contact.pledgeAmount ? Math.round(contact.pledgeAmount) : 0,
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
            ...contact.months.map((month) => Math.round(month.total)),
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

  return csvData;
};
