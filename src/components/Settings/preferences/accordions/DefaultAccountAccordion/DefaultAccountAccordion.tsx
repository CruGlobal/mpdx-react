import React, { ReactElement, useMemo } from 'react';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { AccountListAutocomplete } from 'src/components/common/Autocomplete/AccountListAutocomplete/AccountListAutocomplete';
import { User } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { AccordionProps } from '../../../accordionHelper';
import { GetPersonalPreferencesQuery } from '../../GetPersonalPreferences.generated';
import { useUpdateUserDefaultAccountMutation } from './UpdateDefaultAccount.generated';

interface DefaultAccountAccordionProps
  extends AccordionProps<PreferenceAccordion> {
  data: GetPersonalPreferencesQuery | undefined;
  accountListId: string;
  defaultAccountList: string;
  disabled?: boolean;
}

const preferencesSchema: yup.ObjectSchema<Pick<User, 'defaultAccountList'>> =
  yup.object({
    defaultAccountList: yup.string().required(),
  });

export const DefaultAccountAccordion: React.FC<
  DefaultAccountAccordionProps
> = ({
  handleAccordionChange,
  expandedAccordion,
  data,
  defaultAccountList,
  disabled,
}) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [updateUserDefaultAccount] = useUpdateUserDefaultAccountMutation();

  const label = t('Default Account');
  const accounts = data?.accountLists?.nodes || [];

  const selectedAccount = useMemo(
    () => accounts.find(({ id }) => id === defaultAccountList)?.name ?? '',
    [accounts, defaultAccountList],
  );

  const onSubmit = async (attributes: Pick<User, 'defaultAccountList'>) => {
    await updateUserDefaultAccount({
      variables: {
        input: {
          attributes: {
            defaultAccountList: attributes.defaultAccountList,
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
    <AccordionItem
      accordion={PreferenceAccordion.DefaultAccount}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={selectedAccount}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          defaultAccountList: defaultAccountList,
        }}
        validationSchema={preferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
        validateOnMount
      >
        {({
          values: { defaultAccountList },
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }): ReactElement => (
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
                value={defaultAccountList}
                onChange={(_, value) => {
                  setFieldValue('defaultAccountList', value);
                }}
                options={accounts}
                textFieldProps={{
                  placeholder: label,
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus: true,
                  label: label,
                  sx: { marginTop: 1 },
                }}
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
