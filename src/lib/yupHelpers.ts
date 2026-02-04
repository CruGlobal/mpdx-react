import { DateTime } from 'luxon';
import { TFunction } from 'react-i18next';
import * as yup from 'yup';

export const phoneNumber = (t: TFunction) =>
  yup.string().test('is-phone-number', t('Invalid phone number'), (val) => {
    if (!val) {
      return false;
    }
    const cleaned = val.replace(/\D/g, '');
    return /^1?\d{10}$/.test(cleaned);
  });

export const dateTime = () =>
  yup
    .mixed<DateTime>()
    .test('valid-date', (value) => Boolean(!value || value.isValid));

export const nullableDateTime = () => dateTime().nullable().defined();

export const requiredDateTime = (requiredMessage = '') =>
  dateTime().required(requiredMessage);

export const integer = (fieldName: string, t: TFunction) =>
  yup
    .number()
    .typeError(t('{{fieldName}} must be a number', { fieldName }))
    .integer(t('{{fieldName}} must be a whole number', { fieldName }))
    .min(0, t('{{fieldName}} must be positive', { fieldName }));

interface AmountOptions {
  required?: boolean;
  max?: number | null | undefined;
  maxMessage?: string;
}

export const amount = (
  fieldName: string,
  t: TFunction,
  options?: AmountOptions,
) => {
  let schema = yup
    .number()
    .typeError(t('{{fieldName}} must be a number', { fieldName }))
    .min(0, t('{{fieldName}} must be positive', { fieldName }));

  if (options?.required) {
    schema = schema.required(t('{{fieldName}} is required', { fieldName }));
  }

  if (typeof options?.max === 'number') {
    schema = schema.max(options.max, options.maxMessage);
  }

  return schema;
};

export const percentage = (fieldName: string, t: TFunction) =>
  yup
    .number()
    .typeError(t('{{fieldName}} must be a number', { fieldName }))
    .min(0, t('{{fieldName}} must be positive', { fieldName }))
    .max(100, t('{{fieldName}} must not exceed 100%', { fieldName }));
