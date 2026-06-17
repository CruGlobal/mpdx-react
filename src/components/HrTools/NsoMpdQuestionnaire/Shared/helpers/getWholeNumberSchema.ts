import { TFunction } from 'react-i18next';
import * as yup from 'yup';

interface WholeNumberMessages {
  /** Overrides the "positive" validation message (e.g. "Please enter a positive amount."). */
  positive?: string;
  /** Overrides the "whole" validation message (e.g. "Please enter a whole dollar amount."). */
  whole?: string;
}

/**
 * yup schema for a required, non-negative whole number. Leading zeros
 * are normalized. Callers supply the required message and may override the
 * positive/whole validation messages for domain-specific copy.
 */
export const getWholeNumberSchema = (
  t: TFunction,
  requiredMessage: string,
  messages: WholeNumberMessages = {},
): yup.StringSchema =>
  yup
    .string()
    // Normalize leading zeros
    .transform((value) =>
      typeof value === 'string' ? value.replace(/^0+(?=\d)/, '') : value,
    )
    .matches(/^[^-]/, messages.positive ?? t('Please enter a positive number.'))
    .matches(/^\d+$/, messages.whole ?? t('Please enter a whole number.'))
    .required(requiredMessage);
