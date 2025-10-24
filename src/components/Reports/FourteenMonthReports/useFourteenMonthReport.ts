import { useMemo } from 'react';
import { useGetFourteenMonthReportQuery } from 'src/components/Reports/FourteenMonthReports/GetFourteenMonthReport.generated';
import { convertStatus } from 'src/utils/functions/convertContactStatus';
import { FourteenMonthReportCurrencyType } from './FourteenMonthReport';

interface CurrencyGroup {
  totals: {
    year: string;
    year_converted: string;
    months: string[];
  };
  donation_infos: {
    contact_id: string;
    total: string;
    complete_months_total: string;
    average: string;
    minimum: string;
    months: {
      total: string;
      donations: {
        amount: string;
        converted_amount: string;
        donation_date: string;
        payment_method: string | null;
        currency: string;
      }[];
    }[];
  }[];
}

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
      // If fetchSalaryReport is true, we fetch the salary currency report
      // If false, we fetch the donor currency report
      fetchSalaryReport:
        currencyType === FourteenMonthReportCurrencyType.Salary,
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
    const currencyGroups = data.currencyGroups as Record<string, CurrencyGroup>;
    return {
      currencyType,
      salaryCurrency: data.defaultCurrency,
      currencyGroups: Object.entries(currencyGroups).map(
        ([currency, currencyGroup]) => ({
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
              if (!contact) {
                return null;
              }
              return {
                id: contactDonationInfo.contact_id,
                name: contact.contactName,
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
                accountNumbers: contact.accountNumbers,
                lateBy30Days: contact.lateBy30Days,
                lateBy60Days: contact.lateBy60Days,
                pledgeAmount: contact.pledgeAmount
                  ? Number(contact.pledgeAmount)
                  : null,
                pledgeCurrency: contact.pledgeCurrency,
                pledgeFrequency: contact.pledgeFrequency,
                status: convertStatus(contact.status),
              };
            })
            .filter((contact) => contact !== null)
            .sort((a, b) => a.name.localeCompare(b.name)),
        }),
      ),
    };
  }, [currencyType, data]);

  return { fourteenMonthReport, loading, error };
};
