import { TFunction } from 'react-i18next';
import { SavingsFundTransferFailureReasonCode } from 'src/graphql/types.generated';

export const getLocalizedFailureReason = (
  t: TFunction,
  reasonCode: SavingsFundTransferFailureReasonCode,
): string => {
  switch (reasonCode) {
    case SavingsFundTransferFailureReasonCode.InactiveAccount:
      return t('The staff account was inactive.');
    case SavingsFundTransferFailureReasonCode.InsufficientFunds:
      return t('The fund did not have enough available balance.');
    case SavingsFundTransferFailureReasonCode.MissingFundType:
      return t('One of the funds does not exist on the staff account.');
    case SavingsFundTransferFailureReasonCode.NotAttempted:
      return t('The retry window ended before it could go through.');
    case SavingsFundTransferFailureReasonCode.Other:
      return t('Something went wrong while processing the transfer.');
    case SavingsFundTransferFailureReasonCode.SettledPeriod:
      return t('The transfer date was in a period that had already closed.');
  }
};
