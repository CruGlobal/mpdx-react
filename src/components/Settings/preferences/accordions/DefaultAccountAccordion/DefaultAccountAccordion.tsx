import React, { ReactElement, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import * as Types from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { GetPersonalPreferencesQuery } from '../../GetPersonalPreferences.generated';
import { useUpdateUserDefaultAccountMutation } from './UpdateDefaultAccount.generated';

interface DefaultAccountAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  data: GetPersonalPreferencesQuery | undefined;
  accountListId: string;
  defaultAccountList: string;
}

export const DefaultAccountAccordion: React.FC<
  DefaultAccountAccordionProps
> = ({ handleAccordionChange, expandedPanel, data, defaultAccountList }) => {
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

  const PreferencesSchema: yup.SchemaOf<
    Pick<Types.User, 'defaultAccountList'>
  > = yup.object({
    defaultAccountList: yup.string().required(),
  });

  const onSubmit = async (
    attributes: Pick<Types.User, 'defaultAccountList'>,
  ) => {
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
        handleAccordionChange(label);
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
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={label}
      value={selectedAccount}
      fullWidth
    >
      <Formik
        initialValues={{
          defaultAccountList: defaultAccountList,
        }}
        validationSchema={PreferencesSchema}
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
              labelText={label}
              helperText={t(
                'This sets which account you will land in whenever you login to {{appName}}.',
                { appName },
              )}
            >
              <Autocomplete
                disabled={isSubmitting}
                autoHighlight
                value={defaultAccountList}
                onChange={(_, value) => {
                  setFieldValue('defaultAccountList', value);
                }}
                options={accounts.map((account) => account.id) || []}
                getOptionLabel={(defaultAccountList): string =>
                  accounts.find(({ id }) => id === defaultAccountList)?.name ??
                  ''
                }
                fullWidth
                renderInput={(params) => (
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  <TextField {...params} placeholder={label} autoFocus />
                )}
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
