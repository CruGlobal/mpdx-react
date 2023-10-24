import React, { ReactElement } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import * as Types from '../../../../../../graphql/types.generated';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import {
  GetAccountPreferencesQuery,
  GetAccountPreferencesDocument,
} from '../../GetAccountPreferences.generated';

interface MonthlyGoalAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: GetAccountPreferencesQuery | undefined;
  accountListId: string;
}

export const MonthlyGoalAccordion: React.FC<MonthlyGoalAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  data,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const label = 'Monthly Goal';

  const AccountPreferencesSchema: yup.SchemaOf<
    Pick<Types.AccountListSettingsInput, 'monthlyGoal'>
  > = yup.object({
    monthlyGoal: yup.number().required(),
  });

  const onSubmit = async (
    attributes: Pick<Types.AccountListSettingsInput, 'monthlyGoal'>,
  ) => {
    await updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            settings: { monthlyGoal: attributes.monthlyGoal },
          },
        },
      },
      update: (cache) => {
        cache.updateQuery(
          {
            query: GetAccountPreferencesDocument,
            variables: {
              accountListId,
            },
          },
          (data) => {
            return {
              user: data.user,
              accountList: {
                ...data.accountList,
                settings: {
                  ...data.accountList.settings,
                  monthlyGoal: attributes.monthlyGoal,
                },
              },
              accountLists: data.accountLists,
            };
          },
        );
      },
      onCompleted: () => {
        enqueueSnackbar(t('Saved successfully.'), {
          variant: 'success',
        });
        handleAccordionChange(label);
      },
      onError: () => {
        //console.log('error: ', e);
        enqueueSnackbar(t('Saving failed.'), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={t(label)}
      value={String(data?.accountList?.settings?.monthlyGoal) || ''}
      fullWidth={true}
    >
      <Formik
        initialValues={{
          monthlyGoal: data?.accountList?.settings?.monthlyGoal || 0,
        }}
        validationSchema={AccountPreferencesSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { monthlyGoal },
          handleSubmit,
          isSubmitting,
          isValid,
          handleChange,
        }): ReactElement => (
          <FormWrapper
            onSubmit={handleSubmit}
            isValid={isValid}
            isSubmitting={isSubmitting}
          >
            {loading && <Skeleton height="90px" />}
            {!loading && (
              <FieldWrapper
                labelText={t(label)}
                helperText={t(
                  'This amount should be set to the amount your organization has determined is your target monthly goal. If you do not know, make your best guess for now. You can change it at any time.',
                )}
              >
                <TextField
                  value={monthlyGoal}
                  onChange={handleChange('monthlyGoal')}
                  inputProps={{ 'aria-label': t(label), type: 'number' }}
                  // error={!!errors.lastName}
                  // helperText={errors.lastName && t('Monthly Goal is required')}
                  required
                />
              </FieldWrapper>
            )}
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
