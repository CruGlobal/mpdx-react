import React, { ReactElement } from 'react';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  AccountListAutocomplete,
  AccountListOption,
} from 'src/common/Autocompletes/AccountListAutocomplete';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { AccordionProps } from '../../../accordionHelper';
import { GetPersonalPreferencesQuery } from '../../GetPersonalPreferences.generated';
import { useUpdateUserDefaultAccountMutation } from './UpdateDefaultAccount.generated';

interface DefaultAccountAccordionProps
  extends AccordionProps<PreferenceAccordion> {
  data: GetPersonalPreferencesQuery | undefined;
  defaultAccountListId: string;
  disabled?: boolean;
}

const preferencesSchema = yup.object({
  defaultAccountListOption: yup
    .object({
      id: yup.string(),
      name: yup.string(),
    })
    .required(),
});

export const DefaultAccountAccordion: React.FC<
  DefaultAccountAccordionProps
> = ({
  handleAccordionChange,
  expandedAccordion,
  data,
  defaultAccountListId,
  disabled,
}) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updateUserDefaultAccount] = useUpdateUserDefaultAccountMutation();

  const label = t('Default Account');
  const accounts = data?.accountLists?.nodes || [];
  const onSubmit = async (attributes: {
    defaultAccountListOption: AccountListOption | null;
  }) => {
    await updateUserDefaultAccount({
      variables: {
        input: {
          attributes: {
            defaultAccountList: attributes?.defaultAccountListOption?.id,
          },
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Saved successfully.'), {
          variant: 'success',
        });
        handleAccordionChange(null);
      },
      onError: () => {
        enqueueSnackbar(t('Saving failed.'), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <Formik
      initialValues={{
        defaultAccountListOption:
          accounts.find(({ id }) => id === defaultAccountListId) || null,
      }}
      validationSchema={preferencesSchema}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnMount
    >
      {({
        values: { defaultAccountListOption: currentSelection },
        handleSubmit,
        setFieldValue,
        isSubmitting,
        isValid,
      }): ReactElement => (
        <AccordionItem
          accordion={PreferenceAccordion.DefaultAccount}
          onAccordionChange={handleAccordionChange}
          expandedAccordion={expandedAccordion}
          label={label}
          value={currentSelection?.name || ''}
          fullWidth
          disabled={disabled}
        >
          <FormWrapper
            onSubmit={handleSubmit}
            isValid={isValid}
            isSubmitting={isSubmitting}
          >
            <FieldWrapper
              helperText={t(
                'This sets which account you will land in whenever you login to {{appName}}.',
                { appName },
              )}
            >
              <AccountListAutocomplete
                disabled={isSubmitting}
                value={currentSelection}
                onChange={(_, value) => {
                  setFieldValue('defaultAccountListOption', value);
                }}
                options={accounts}
                textFieldProps={{
                  placeholder: label,
                  autoFocus: true,
                  label: label,
                  sx: { marginTop: 1 },
                }}
              />
            </FieldWrapper>
          </FormWrapper>
        </AccordionItem>
      )}
    </Formik>
  );
};
