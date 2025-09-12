import { useMemo } from 'react';
import { ReportsSalaryCurrencyDonationsQuery } from 'src/components/Reports/FourteenMonthReports/GetFourteenMonthReport.generated';
import {
  FourteenMonthReport,
  FourteenMonthReportCurrencyType,
} from 'src/graphql/types.generated';
import { convertStatus } from 'src/utils/functions/convertContactStatus';

type CurrencyGroups = NonNullable<
  ReportsSalaryCurrencyDonationsQuery['reportsSalaryCurrencyDonations']
>['currencyGroups'];

export const useFourteenMonthReport = (
  data: ReportsSalaryCurrencyDonationsQuery['reportsSalaryCurrencyDonations'],
  currencyType: FourteenMonthReportCurrencyType,
): FourteenMonthReport =>
  useMemo(() => {
    const isSalaryType =
      currencyType === FourteenMonthReportCurrencyType.Salary;
    const currencyGroups: CurrencyGroups = data?.currencyGroups;

    return {
      currencyType,
      salaryCurrency: data?.defaultCurrency ?? 'USD',
      currencyGroups: Object.entries(currencyGroups ?? {}).map(
        ([currency, currencyGroup]) => ({
          currency: currency.toUpperCase(),
          totals: {
            year: Number(
              isSalaryType
                ? (currencyGroup as any).totals.year_converted
                : (currencyGroup as any).totals.year,
            ),
            months: (currencyGroup as any).totals.months.map(
              (total, index) => ({
                month: data?.months[index],
                total: Number(total),
              }),
            ),
            average: (currencyGroup as any).donation_infos.reduce(
              (averageTotal, contactDonationInfo) =>
                averageTotal + Number(contactDonationInfo.average),
              0,
            ),
            minimum: (currencyGroup as any).donation_infos.reduce(
              (minimumTotal, contactDonationInfo) =>
                minimumTotal + Number(contactDonationInfo.minimum),
              0,
            ),
          },
          contacts: (currencyGroup as any).donation_infos
            .map((contactDonationInfo) => {
              const contact = data?.donorInfos.find(
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
                    month: data?.months[index],
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
