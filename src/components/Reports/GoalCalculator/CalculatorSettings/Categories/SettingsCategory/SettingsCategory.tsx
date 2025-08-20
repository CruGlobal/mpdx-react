import { useRouter } from 'next/router';
import React from 'react';
import { TextField } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { getQueryParam } from 'src/utils/queryParam';
import { useGoalCalculationQuery } from '../../../Shared/GoalCalculation.generated';
import { useUpdateGoalCalculationMutation } from './GoalCalculation.generated';

export const SettingsCategory: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';
  const { query } = useRouter();
  const goalCalculationId = getQueryParam(query, 'goalCalculationId') ?? '';

  const shouldFetch = !!accountListId && !!goalCalculationId;
  const { data: goalData } = useGoalCalculationQuery({
    variables: { accountListId, id: goalCalculationId },
    skip: !shouldFetch,
  });

  const [updateGoalCalculationMutation] = useUpdateGoalCalculationMutation();

  const debouncedUpdateGoalTitle = useDebouncedCallback((title: string) => {
    updateGoalCalculationMutation({
      variables: {
        input: {
          accountListId,
          attributes: {
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

  const goalTitle = goalData?.goalCalculation.name ?? '';

  return (
    <Formik
      initialValues={{ goalTitle: goalTitle }}
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

              try {
                validationSchema.validateSync({
                  goalTitle: event.target.value,
                });
                debouncedUpdateGoalTitle(event.target.value);
              } catch {
                // Don't call mutation if validation fails
              }
            }}
          />
        </Form>
      )}
    </Formik>
  );
};
