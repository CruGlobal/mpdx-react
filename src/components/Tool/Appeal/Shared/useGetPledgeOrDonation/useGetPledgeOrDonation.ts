import { useMemo } from 'react';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { AppealStatusEnum } from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from 'src/components/Tool/Appeal/AppealsContext/contacts.generated';
import { PledgeFrequencyEnum } from 'src/graphql/types.generated';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';
import { useLocale } from '../../../../../hooks/useLocale';

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
      : amount?.toString() || currencyFormat(0, currency, locale);

  let pledgeOverdue = false;
  if (
    (appealStatus === AppealStatusEnum.NotReceived ||
      appealStatus === AppealStatusEnum.ReceivedNotProcessed) &&
    dateOrFrequency
  ) {
    const date = DateTime.fromISO(dateOrFrequency).startOf('day');
    if (date <= DateTime.local().startOf('day')) {
      pledgeOverdue = true;
    }
  }

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
      : '';
  return {
    amount: pledgeOrDonationAmount,
    dateOrFrequency: pledgeOrDonationDate,
    pledgeOverdue,
  };
};

interface AmountAndFrequency {
  amount: string;
  dateOrFrequency?: string;
}
export interface UseGetPledgeOrDonation {
  pledgeValues: AppealContactInfoFragment['pledges'][0] | undefined;
  amountAndFrequency: AmountAndFrequency | null;
  pledgeDonations: string[] | null;
  pledgeOverdue: boolean;
}

interface UseGetPledgeOrDonationProps {
  appealStatus: AppealStatusEnum;
  contact: AppealContactInfoFragment;
  appealId: string;
}

export const useGetPledgeOrDonation = (
  props: UseGetPledgeOrDonationProps,
): UseGetPledgeOrDonation => {
  const locale = useLocale();
  const { t } = useTranslation();
  const { appealStatus, contact, appealId } = props;

  const defaultValues = {
    amountAndFrequency: null,
    pledgeValues: undefined,
    pledgeOverdue: false,
    pledgeDonations: null,
  };

  const pledgeOrDonation = useMemo(() => {
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

      return {
        ...defaultValues,
        amountAndFrequency: {
          amount,
          dateOrFrequency,
        },
      };
    } else if (
      appealStatus === AppealStatusEnum.NotReceived ||
      appealStatus === AppealStatusEnum.ReceivedNotProcessed
    ) {
      const appealPledge = pledges?.find(
        (pledge) => pledge.appeal.id === appealId,
      );

      if (!appealPledge) {
        return {
          ...defaultValues,
          amountAndFrequency: {
            amount: currencyFormat(0, 'USD', locale),
            dateOrFrequency: '',
          },
        };
      }

      const {
        amount,
        dateOrFrequency,
        pledgeOverdue: overdue,
      } = formatPledgeOrDonation({
        amount: appealPledge?.amount,
        currency: appealPledge.amountCurrency,
        appealStatus,
        dateOrFrequency: appealPledge.expectedDate,
        locale,
        t,
      });

      return {
        ...defaultValues,
        amountAndFrequency: {
          amount,
          dateOrFrequency: `(${dateOrFrequency})`,
        },
        pledgeValues: appealPledge,
        pledgeOverdue: overdue,
      };
    } else if (appealStatus === AppealStatusEnum.Processed) {
      const appealPledge = pledges?.find(
        (pledge) => pledge.appeal.id === appealId,
      );

      const amountAndFrequency = {
        amount: currencyFormat(0, 'USD', locale),
        dateOrFrequency: '',
      };
      let pledgeValues: AppealContactInfoFragment['pledges'][0] | undefined =
        undefined;

      if (appealPledge) {
        const { amount } = formatPledgeOrDonation({
          amount: appealPledge?.amount,
          currency: appealPledge.amountCurrency,
          appealStatus,
          locale,
          t,
        });
        amountAndFrequency.amount = amount;
        pledgeValues = appealPledge;
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

      return {
        ...defaultValues,
        amountAndFrequency,
        pledgeValues,
        pledgeDonations: givenDonations,
      };
    }
  }, [appealStatus, contact, locale]);

  if (pledgeOrDonation) {
    return pledgeOrDonation;
  } else {
    return defaultValues;
  }
};
