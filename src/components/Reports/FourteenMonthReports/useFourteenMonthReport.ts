import { useMemo } from 'react';
import {
  GetFourteenMonthReportQuery,
  useGetFourteenMonthReportQuery,
} from 'src/components/Reports/FourteenMonthReports/GetFourteenMonthReport.generated';
import { convertStatus } from 'src/utils/functions/convertContactStatus';
import { FourteenMonthReportCurrencyType } from './FourteenMonthReport';

type CurrencyGroups = NonNullable<
  GetFourteenMonthReportQuery['reportsSalaryCurrencyDonations']
>['currencyGroups'];

export const useFourteenMonthReport = (
  accountListId: string,
  currencyType: FourteenMonthReportCurrencyType,
  designationAccounts?: string[],
) => {
  const {
    data: gqlData,
    loading,
    error,
  } = useGetFourteenMonthReportQuery({
    variables: {
      accountListId,
      // Backend sends one extra month, e.g. 13m returns 14 months
      range: '13m',
      designationAccountId:
        designationAccounts && designationAccounts.length > 0
          ? designationAccounts
          : null,
    },
  });

  const data =
    currencyType === FourteenMonthReportCurrencyType.Salary
      ? gqlData?.reportsSalaryCurrencyDonations
      : gqlData?.reportsDonorCurrencyDonations;

  const fourteenMonthReport = useMemo(() => {
    if (!data) {
      return null;
    }

    const isSalaryType =
      currencyType === FourteenMonthReportCurrencyType.Salary;
    const currencyGroups: CurrencyGroups = data.currencyGroups;

    return {
      currencyType,
      salaryCurrency: data.defaultCurrency ?? 'USD',
      currencyGroups: Object.entries(currencyGroups ?? {}).map(
        ([currency, currencyGroup]: [string, CurrencyGroups[string]]) => ({
          currency,
          totals: {
            year: Number(
              isSalaryType
                ? currencyGroup.totals.year_converted
                : currencyGroup.totals.year,
            ),
            months: currencyGroup.totals.months.map((total, index) => ({
              month: data.months[index],
              total: Number(total),
            })),
            average: currencyGroup.donation_infos.reduce(
              (averageTotal, contactDonationInfo) =>
                averageTotal + Number(contactDonationInfo.average),
              0,
            ),
            minimum: currencyGroup.donation_infos.reduce(
              (minimumTotal, contactDonationInfo) =>
                minimumTotal + Number(contactDonationInfo.minimum),
              0,
            ),
          },
          contacts: currencyGroup.donation_infos
            .map((contactDonationInfo) => {
              const contact = data.donorInfos.find(
                (donor) => donor.contactId === contactDonationInfo.contact_id,
              );
              return {
                id: contactDonationInfo.contact_id,
                name: contact?.contactName ?? '',
                total: Number(contactDonationInfo.total),
                completeMonthsTotal: Number(
                  contactDonationInfo.complete_months_total,
                ),
                average: Number(contactDonationInfo.average),
                minimum: Number(contactDonationInfo.minimum),
                months: contactDonationInfo.months.map((month, index) => {
                  const salaryCurrencyTotal = month.donations.reduce(
                    (convertedTotal, donation) =>
                      convertedTotal + Number(donation.converted_amount),
                    0,
                  );
                  return {
                    month: data.months[index],
                    total: isSalaryType
                      ? salaryCurrencyTotal
                      : Number(month.total),
                    salaryCurrencyTotal,
                    donations: month.donations.map((donation) => ({
                      amount: Number(donation.amount),
                      date: donation.donation_date,
                      paymentMethod: donation.payment_method,
                      currency: donation.currency,
                    })),
                  };
                }),
                accountNumbers: contact?.accountNumbers ?? [],
                lateBy30Days: contact?.lateBy30Days ?? false,
                lateBy60Days: contact?.lateBy60Days ?? false,
                pledgeAmount: contact?.pledgeAmount
                  ? Number(contact?.pledgeAmount)
                  : null,
                pledgeCurrency: contact?.pledgeCurrency,
                pledgeFrequency: contact?.pledgeFrequency,
                status: convertStatus(contact?.status),
              };
            })
            .sort((a, b) => a.name.localeCompare(b.name)),
        }),
      ),
    };
  }, [currencyType, data]);

  return { fourteenMonthReport, loading, error };
};
