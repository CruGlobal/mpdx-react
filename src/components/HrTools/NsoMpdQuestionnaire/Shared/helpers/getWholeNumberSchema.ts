import { TFunction } from 'react-i18next';
import * as yup from 'yup';

interface WholeNumberMessages {
  /** Overrides the "positive" validation message (e.g. "Please enter a positive amount."). */
  positive?: string;
  /** Overrides the "whole" validation message (e.g. "Please enter a whole dollar amount."). */
  whole?: string;
}

/**
 * yup schema for a required, non-negative whole number. Callers supply the required message and may override the
 * positive/whole validation messages for domain-specific copy.
 */
export const getWholeNumberSchema = (
  t: TFunction,
  requiredMessage: string,
  messages: WholeNumberMessages = {},
): yup.NumberSchema =>
  yup
    .number()
    .typeError(messages.whole ?? t('Please enter a whole number.'))
    .min(0, messages.positive ?? t('Please enter a positive number.'))
    .integer(messages.whole ?? t('Please enter a whole number.'))
    .required(requiredMessage);
