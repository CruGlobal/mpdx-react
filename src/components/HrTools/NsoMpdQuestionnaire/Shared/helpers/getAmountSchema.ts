import { TFunction } from 'react-i18next';
import * as yup from 'yup';
import { getWholeNumberSchema } from './getWholeNumberSchema';

/**
 * Yup schema for a required, non-negative whole-dollar amount (no cents). Built on
 * {@link getWholeNumberSchema} with dollar-specific validation copy.
 */
export const getAmountSchema = (t: TFunction): yup.NumberSchema =>
  getWholeNumberSchema(t, t('Please enter an amount, or 0 if you have none.'), {
    positive: t('Please enter a positive amount.'),
    whole: t('Please enter a whole dollar amount.'),
  });
