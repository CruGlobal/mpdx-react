import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AutosaveTextField } from '../Autosave/AutosaveTextField';

export const SettingsCategory: React.FC = () => {
  const { t } = useTranslation();

  const validationSchema = useMemo(
    () =>
      yup.object({
        name: yup.string().required(t('Goal Name is a required field')),
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
