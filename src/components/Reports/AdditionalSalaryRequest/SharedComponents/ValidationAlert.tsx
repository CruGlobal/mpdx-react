import { useMemo } from 'react';
import { Alert } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { fieldConfig } from '../Shared/useAdditionalSalaryRequestForm';

export const ValidationAlert: React.FC = () => {
  const { t } = useTranslation();
  const { submitCount, isValid, errors } =
    useFormikContext<CompleteFormValues>();

  const exceedingLimitFields = useMemo(() => {
    if (!errors || !submitCount) {
      return [];
    }

    return fieldConfig
      .filter(({ key, max }) => {
        if (!max) {
          return false;
        }
        const error = errors[key as keyof CompleteFormValues];
        return (
          typeof error === 'string' && error.toLowerCase().includes('exceeds')
        );
      })
      .map(({ label }) => t(label));
  }, [errors, submitCount, t]);

  if (!submitCount || isValid) {
    return null;
  }

  return (
    <Alert severity="error" sx={{ mt: 2, '& ul': { m: 0, pl: 3 } }}>
      {t('Your form is missing information.')}
      <ul>
        <li>{t('Please enter a value for all required fields.')}</li>
        {exceedingLimitFields.length > 0 && (
          <li>
            {t('The following fields exceed their limits: {{fields}}', {
              fields: exceedingLimitFields.join(', '),
            })}
          </li>
        )}
      </ul>
    </Alert>
  );
};
