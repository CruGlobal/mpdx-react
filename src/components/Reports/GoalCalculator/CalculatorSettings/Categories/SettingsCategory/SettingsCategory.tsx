import React from 'react';
import { TextField } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export const SettingsCategory: React.FC = () => {
  const { t } = useTranslation();

  /*
   * TODO: Check if title exists when fetching goal,
   * replace below with query data when available.
   */
  const goalTitle = '';

  const validationSchema = yup.object({
    goalTitle: yup
      .string()
      .min(2, t('Goal title must be at least 2 characters'))
      .max(60, t('Goal title must be at most 60 characters'))
      .required('Goal title is a required field'),
  });

  const handleSubmit = () => {
    // TODO: mutate/update goal title here
  };

  return (
    <Formik
      initialValues={{ goalTitle }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, setFieldTouched, handleChange }) => (
        <Form>
          <Field
            as={TextField}
            name="goalTitle"
            fullWidth
            label={t('Goal Title')}
            error={!!errors.goalTitle}
            helperText={errors.goalTitle}
            onChange={(event: React.SyntheticEvent) => {
              handleChange(event);
              setFieldTouched('goalTitle', true, false);
            }}
          />
        </Form>
      )}
    </Formik>
  );
};
