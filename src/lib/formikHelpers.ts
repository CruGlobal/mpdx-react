import { DateTime } from 'luxon';
import * as yup from 'yup';

export const dateTime = () =>
  yup
    .mixed<DateTime>()
    .test('valid-date', (value) => Boolean(!value || value.isValid));

export const nullableDateTime = () => dateTime().nullable().defined();

export const requiredDateTime = () => dateTime().required();
