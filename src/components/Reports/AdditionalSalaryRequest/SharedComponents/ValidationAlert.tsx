import { useMemo } from 'react';
import { Alert } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { fieldConfig } from '../Shared/useAdditionalSalaryRequestForm';

export const ValidationAlert: React.FC = () => {
  const { t } = useTranslation();
  const { submitCount, isValid, values, errors } =
    useFormikContext<CompleteFormValues>();
  const { salaryInfo, isInternational } = useAdditionalSalaryRequest();

  const exceedingLimitFields = useMemo(() => {
    if (!submitCount || !salaryInfo) {
      return [];
    }

    return fieldConfig
      .filter(({ key, salaryInfoIntKey, salaryInfoUssKey }) => {
        if (!salaryInfoIntKey || !salaryInfoUssKey) {
          return false;
        }
        const maxKey = isInternational ? salaryInfoIntKey : salaryInfoUssKey;
        const max = salaryInfo[maxKey] as number | undefined;
        if (!max) {
          return false;
        }
        const value = parseFloat(
          values[key as keyof CompleteFormValues] as string,
        );
        return !isNaN(value) && value > max;
      })
      .map(({ label }) => t(label));
  }, [submitCount, salaryInfo, isInternational, values, t]);

  if (!submitCount || isValid) {
    return null;
  }

  const hasFieldErrors = Object.keys(errors).some(
    (key) => key !== 'totalAdditionalSalaryRequested',
  );

  return (
    <Alert severity="error" sx={{ mt: 2, '& ul': { m: 0, pl: 3 } }}>
      {t('Your form is missing information.')}
      <ul>
        {hasFieldErrors && (
          <li>{t('Please enter a value for all required fields.')}</li>
        )}
        {exceedingLimitFields.length > 0 && (
          <li>
            {t('The following fields exceed their limits: {{fields}}', {
              fields: exceedingLimitFields.join(', '),
            })}
          </li>
        )}
        {errors.totalAdditionalSalaryRequested && (
          <li>
            {t(
              'Your total additional salary requested exceeds your account balance.',
            )}
          </li>
        )}
      </ul>
    </Alert>
  );
};
