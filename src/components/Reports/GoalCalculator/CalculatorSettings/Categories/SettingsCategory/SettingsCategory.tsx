import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AutosaveTextField } from '../Autosave/AutosaveTextField';

export const SettingsCategory: React.FC = () => {
  const { t } = useTranslation();

  const validationSchema = useMemo(
    () =>
      yup.object({
        name: yup
          .string()
          .min(2, t('Goal name must be at least 2 characters'))
          .max(60, t('Goal name must be at most 60 characters'))
          .required(t('Goal name is a required field')),
      }),
    [t],
  );

  return (
    <AutosaveTextField
      fieldName="name"
      schema={validationSchema}
      label={t('Goal Name')}
    />
  );
};
