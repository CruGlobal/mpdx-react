import { useRouter } from 'next/router';
import React, { useRef } from 'react';
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
  const hasUserInteracted = useRef(false);

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
      key={goalCalculationId}
      initialValues={{ goalTitle: goalTitle }}
      enableReinitialize={!hasUserInteracted.current}
      validationSchema={validationSchema}
      validateOnChange
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
              hasUserInteracted.current = true;
              handleChange(event);
              setFieldTouched('goalTitle', true, false);

              // isValid doesn't work here. isValidSync allows for synchronous validation.
              if (
                validationSchema.isValidSync({ goalTitle: event.target.value })
              ) {
                debouncedUpdateGoalTitle(event.target.value);
              }
            }}
          />
        </Form>
      )}
    </Formik>
  );
};
