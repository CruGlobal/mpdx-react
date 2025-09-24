import React from 'react';
import { TextField } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { useUpdateGoalCalculationMutation } from './GoalCalculation.generated';

export const SettingsCategory: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';

  const { goalCalculationResult, trackMutation } = useGoalCalculator();
  const goal = goalCalculationResult.data?.goalCalculation;

  const [updateGoalCalculationMutation] = useUpdateGoalCalculationMutation();

  const updateGoalTitle = (name: string) => {
    if (!goal?.id) {
      return;
    }

    trackMutation(
      updateGoalCalculationMutation({
        variables: {
          input: {
            accountListId,
            attributes: {
              id: goal.id,
              name,
            },
          },
        },
      }),
    );
  };

  const validationSchema = yup.object({
    goalName: yup
      .string()
      .min(2, t('Goal name must be at least 2 characters'))
      .max(60, t('Goal name must be at most 60 characters'))
      .required(t('Goal name is a required field')),
  });

  const goalName = goal?.name ?? '';

  return (
    <Formik
      initialValues={{ goalName }}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={() => {}}
    >
      {({ errors, isValid }) => (
        <Form>
          <Field
            as={TextField}
            name="goalName"
            fullWidth
            label={t('Goal Name')}
            error={!!errors.goalName}
            helperText={errors.goalName}
            onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
              if (isValid) {
                updateGoalTitle(event.target.value);
              }
            }}
          />
        </Form>
      )}
    </Formik>
  );
};
