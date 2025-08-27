import React from 'react';
import { TextField } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import {
  useCreateGoalCalculationMutation,
  useGoalCalculationQuery,
} from './GoalCalculation.generated';

export const SettingsCategory: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';
  // const { query } = useRouter();
  // const goalCalculationId = getQueryParam(query, 'goalCalculationId') ?? '';

  const goalCalculationId = 'c087c032-6383-480b-bf1d-ce33b827fab7';

  const { data: goalData } = useGoalCalculationQuery({
    variables: {
      accountListId: accountListId,
      goalCalculationId: goalCalculationId,
    },
  });

  const goalTitle = goalData?.goalCalculation.name ?? '';

  const [updateGoalCalculation] = useCreateGoalCalculationMutation();
  const handleUpdateGoalTitle = (title: string) => {
    updateGoalCalculation({
      variables: {
        input: {
          accountListId,
          attributes: {
            name: title,
          },
        },
      },
      optimisticResponse: {
        createGoalCalculation: {
          __typename: 'GoalCalculationCreateMutationPayload',
          goalCalculation: {
            id: goalCalculationId,
            name: title,
          },
        },
      },
    });
  };

  const debouncedUpdateGoalTitle = useDebouncedCallback((title: string) => {
    handleUpdateGoalTitle(title);
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
      initialValues={{ goalTitle }}
      validationSchema={validationSchema}
      onSubmit={() => {}}
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
              const value = (event.target as HTMLInputElement).value;
              handleChange(event);
              setFieldTouched('goalTitle', true, false);
              debouncedUpdateGoalTitle(value);
            }}
          />
        </Form>
      )}
    </Formik>
  );
};
