import { useEffect, useState } from 'react';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { AppealStatusEnum } from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from 'src/components/Tool/Appeal/AppealsContext/contacts.generated';
import { PledgeFrequencyEnum } from 'src/graphql/types.generated';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';

type FormatPledgeOrDonationProps = {
  amount?: number | null;
  currency?: string | null;
  appealStatus: AppealStatusEnum;
  dateOrFrequency?: PledgeFrequencyEnum | string | null;
  locale: string;
  t: TFunction;
};

const formatPledgeOrDonation = ({
  amount,
  currency,
  appealStatus,
  dateOrFrequency,
  locale,
  t,
}: FormatPledgeOrDonationProps) => {
  const pledgeOrDonationAmount =
    amount && currency
      ? currencyFormat(amount, currency, locale)
      : amount || currencyFormat(0, currency, locale);

  const pledgeOrDonationDate =
    appealStatus === AppealStatusEnum.Asked ||
    appealStatus === AppealStatusEnum.Excluded
      ? (dateOrFrequency &&
          getLocalizedPledgeFrequency(
            t,
            dateOrFrequency as PledgeFrequencyEnum,
          )) ??
        ''
      : dateOrFrequency
      ? dateFormat(DateTime.fromISO(dateOrFrequency), locale)
      : null;
  return {
    amount: pledgeOrDonationAmount,
    dateOrFrequency: pledgeOrDonationDate,
  };
};

// The return value doesn't change until `delay` milliseconds have elapsed since the last time `value` changed
export const useGetPledgeOrDonation = (
  appealStatus: AppealStatusEnum,
  contact: AppealContactInfoFragment,
  appealId: string,
  locale: string,
) => {
  const { t } = useTranslation();
  const [pledgeValues, setPledgeValues] =
    useState<AppealContactInfoFragment['pledges'][0]>();
  const [amountAndFrequency, setAmountAndFrequency] = useState<string>();
  const [pledgeDonations, setPledgeDonations] = useState<string[] | null>(null);

  useEffect(() => {
    const {
      pledgeAmount,
      pledgeCurrency,
      pledgeFrequency,
      pledges,
      donations,
    } = contact;

    if (
      appealStatus === AppealStatusEnum.Asked ||
      appealStatus === AppealStatusEnum.Excluded
    ) {
      const { amount, dateOrFrequency } = formatPledgeOrDonation({
        amount: pledgeAmount,
        currency: pledgeCurrency,
        appealStatus,
        dateOrFrequency: pledgeFrequency,
        locale,
        t,
      });
      setAmountAndFrequency(`${amount} ${dateOrFrequency}`);
      setPledgeValues(undefined);
    } else if (
      appealStatus === AppealStatusEnum.NotReceived ||
      appealStatus === AppealStatusEnum.ReceivedNotProcessed
    ) {
      const appealPledge = pledges?.find(
        (pledge) => pledge.appeal.id === appealId,
      );

      if (appealPledge) {
        const { amount, dateOrFrequency } = formatPledgeOrDonation({
          amount: appealPledge?.amount,
          currency: appealPledge.amountCurrency,
          appealStatus,
          dateOrFrequency: appealPledge.expectedDate,
          locale,
          t,
        });

        setPledgeValues(appealPledge);
        setAmountAndFrequency(`${amount} (${dateOrFrequency})`);
      } else {
        setAmountAndFrequency(`${currencyFormat(0, 'USD', locale)}`);
      }
    } else if (appealStatus === AppealStatusEnum.Processed) {
      const appealPledge = pledges?.find(
        (pledge) => pledge.appeal.id === appealId,
      );

      if (appealPledge) {
        const { amount } = formatPledgeOrDonation({
          amount: appealPledge?.amount,
          currency: appealPledge.amountCurrency,
          appealStatus,
          locale,
          t,
        });
        setPledgeValues(appealPledge);
        setAmountAndFrequency(`${amount}`);
      } else {
        setAmountAndFrequency(`${currencyFormat(0, 'USD', locale)}`);
      }

      // Currently we grab all the donations and filter them by the appeal id
      // We need a query that allows us to filter by the appeal id
      // Maybe buy the backend team some donuts and ask them to add a filter to the donations query
      const appealDonations = donations.nodes.filter(
        (donation) => donation?.appeal?.id === appealId,
      );

      const givenDonations = appealDonations.map((donation) => {
        const amount = donation?.appealAmount?.amount;
        const currency = donation?.appealAmount?.convertedCurrency;
        const donationAmount = currencyFormat(
          amount && currency ? amount : 0,
          currency,
          locale,
        );

        const donationDate = dateFormat(
          DateTime.fromISO(donation.donationDate),
          locale,
        );

        return `(${donationAmount}) (${donationDate})`;
      });

      setPledgeDonations(givenDonations);
    }
  }, [appealStatus, contact, locale]);

  return { pledgeValues, amountAndFrequency, pledgeDonations };
};
