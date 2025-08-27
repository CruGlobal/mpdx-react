import React from 'react';
import { TextField } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import {
  useGoalCalculationQuery,
  useUpdateGoalCalculationMutation,
} from './GoalCalculation.generated';

export const SettingsCategory: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';
  // temporary
  const goalCalculationId = '5d8291d7-df70-470b-b1ea-964acbef16c1';

  const { data: goalData } = useGoalCalculationQuery({
    variables: { accountListId, goalCalculationId },
  });

  const [updateGoalCalculation] = useUpdateGoalCalculationMutation();

  const debouncedUpdateGoalTitle = useDebouncedCallback((title: string) => {
    updateGoalCalculation({
      variables: {
        input: {
          accountListId,
          attributes: {
            id: goalCalculationId,
            name: title,
          },
        },
      },
      optimisticResponse: {
        updateGoalCalculation: {
          goalCalculation: {
            id: goalCalculationId,
            name: title,
          },
        },
      },
    });
  }, 500);

  const validationSchema = yup.object({
    goalTitle: yup
      .string()
      .min(2, t('Goal title must be at least 2 characters'))
      .max(60, t('Goal title must be at most 60 characters'))
      .required('Goal title is a required field'),
  });

  return (
    <Formik
      initialValues={{ goalTitle: goalData?.goalCalculation?.name ?? '' }}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={() => {}}
    >
      {({ values, errors, setFieldTouched, handleChange }) => (
        <Form>
          <Field
            as={TextField}
            name="goalTitle"
            fullWidth
            label={t('Goal Title')}
            error={!!errors.goalTitle}
            helperText={errors.goalTitle}
            value={values.goalTitle}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(event);
              setFieldTouched('goalTitle', true, false);
              debouncedUpdateGoalTitle(event.target.value);
            }}
          />
        </Form>
      )}
    </Formik>
  );
};
