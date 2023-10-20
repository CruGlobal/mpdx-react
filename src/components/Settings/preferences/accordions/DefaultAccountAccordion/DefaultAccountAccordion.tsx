import * as yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import React, { ReactElement } from 'react';
import { MenuItem, Select } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import * as Types from '../../../../../../graphql/types.generated';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { useUpdateUserDefaultAccountMutation } from './UpdateDefaultAccount.generated';
import { GetPersonalPreferencesQuery } from '../../GetPersonalPreferences.generated';

interface DefaultAccountAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: GetPersonalPreferencesQuery | undefined;
  accountListId: string;
}

export const DefaultAccountAccordion: React.FC<
  DefaultAccountAccordionProps
> = ({ handleAccordionChange, expandedPanel, loading, data }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateUserDefaultAccount] = useUpdateUserDefaultAccountMutation();

  const label = 'Default Account';
  const accounts = data?.accountLists?.nodes || [];
  const defaultAccountList = data?.user?.defaultAccountList || '';

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
      value={
        data?.accountLists?.nodes.find(
          ({ id }) => String(id) === String(data?.user?.defaultAccountList),
        )?.name ?? ''
      }
      fullWidth={true}
    >
      <Formik
        initialValues={{
          defaultAccountList: defaultAccountList,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
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
            {loading && <Skeleton height="90px" />}
            {!loading && (
              <FieldWrapper
                labelText={t(label)}
                helperText={t(
                  'This sets which account you will land in whenever you login to MPDX.',
                )}
              >
                <Select
                  labelId="preferred-contact-method-select-label"
                  value={defaultAccountList}
                  onChange={(e) =>
                    setFieldValue('defaultAccountList', e.target.value)
                  }
                  fullWidth={true}
                >
                  {accounts.map((account) => (
                    <MenuItem
                      key={account.id}
                      value={account.id}
                      aria-label={account.name}
                    >
                      {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FieldWrapper>
            )}
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
