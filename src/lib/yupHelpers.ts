import { DateTime } from 'luxon';
import { TFunction } from 'react-i18next';
import * as yup from 'yup';

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

export const amount = (fieldName: string, t: TFunction) =>
  yup
    .number()
    .typeError(t('{{fieldName}} must be a number', { fieldName }))
    .min(0, t('{{fieldName}} must be positive', { fieldName }));

export const percentage = (fieldName: string, t: TFunction) =>
  yup
    .number()
    .typeError(t('{{fieldName}} must be a number', { fieldName }))
    .min(0, t('{{fieldName}} must be positive', { fieldName }))
    .max(100, t('{{fieldName}} must not exceed 100%', { fieldName }));
