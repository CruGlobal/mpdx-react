import * as yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import React, { ReactElement } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import * as Types from '../../../../../../graphql/types.generated';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { useUpdateUserDefaultAccountMutation } from './UpdateDefaultAccount.generated';

interface DefaultAccountAccordianProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: any;
  accountListId: string;
}

export const DefaultAccountAccordian: React.FC<
  DefaultAccountAccordianProps
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
                <Autocomplete
                  autoSelect
                  disabled={isSubmitting}
                  autoHighlight
                  loading={loading}
                  value={defaultAccountList}
                  onChange={(_, value) => {
                    setFieldValue('defaultAccountList', value);
                  }}
                  options={accounts.map((account) => account.id) || []}
                  getOptionLabel={(defaultAccountList): string =>
                    accounts.find(
                      ({ id }) => String(id) === String(defaultAccountList),
                    )?.name ?? ''
                  }
                  filterSelectedOptions
                  fullWidth
                  renderInput={(params) => (
                    <TextField {...params} placeholder={t(label)} />
                  )}
                />
              </FieldWrapper>
            )}
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
