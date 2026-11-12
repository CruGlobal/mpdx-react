import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { PledgeFrequencyEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import { FourteenMonthReportCurrencyType } from './FourteenMonthReport';
import {
  calculateSolidMonthlySupport,
  getCommittedMonthlyEquivalent,
  getInHandMonthlyEquivalent,
} from './monthlyEquivalents';
import type { CurrencyTable } from './FourteenMonthReport';

export type CsvData = (string | number)[][];

const formatMonth = (month: string, locale: string): string =>
  DateTime.fromISO(month).toJSDate().toLocaleDateString(locale, {
    month: 'short',
    year: '2-digit',
  });

/*
 * Return the data for a CSV export of the provided currency tables. The salary
 * currency export starts with the Solid Monthly Support total.
 */
export const useCsvData = (
  currencyTables: CurrencyTable[],
  currencyType: FourteenMonthReportCurrencyType,
): CsvData => {
  const { t } = useTranslation();
  const locale = useLocale();
  const apiConstants = useApiConstants();
  const { getLocalizedContactStatus, getLocalizedPledgeFrequency } =
    useLocalizedConstants();

  const tablesCsvData = useMemo(
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
          const pledgedMonthlyEquivalent =
            getCommittedMonthlyEquivalent(contact) ?? '';

          const inHand = getInHandMonthlyEquivalent(contact, 4);
          const inHandMonthlyEquivalent = inHand?.amount ?? '';
          const numMonthsForMonthlyEquivalent = inHand?.numMonths ?? 0;

          const inHandDateRange =
            inHand && inHandMonthlyEquivalent
              ? `${formatMonth(
                  inHand.months[inHand.months.length - 1].month,
                  locale,
                )} - ${formatMonth(inHand.months[0].month, locale)}`
              : '';

          const pledgeFrequency = apiConstants?.pledgeFrequency?.find(
            ({ key }) => key === contact.pledgeFrequency,
          )?.id as PledgeFrequencyEnum | null | undefined;

          return [
            contact.name,
            getLocalizedContactStatus(contact.status?.toUpperCase()),
            contact.pledgeAmount ? Math.round(contact.pledgeAmount) : 0,
            contact.pledgeCurrency ?? '',
            getLocalizedPledgeFrequency(pledgeFrequency),
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

  const csvData = useMemo(() => {
    if (currencyType !== FourteenMonthReportCurrencyType.Salary) {
      return tablesCsvData;
    }
    // One row per currency table: each table's amounts are in its own currency
    const solidMonthlySupportRows = currencyTables.map(
      ({ currency, orderedContacts }) => [
        t('Solid Monthly Support'),
        calculateSolidMonthlySupport(orderedContacts, currency),
        currency,
      ],
    );
    return [...solidMonthlySupportRows, ...tablesCsvData];
  }, [currencyTables, currencyType, tablesCsvData, t]);

  return csvData;
};
