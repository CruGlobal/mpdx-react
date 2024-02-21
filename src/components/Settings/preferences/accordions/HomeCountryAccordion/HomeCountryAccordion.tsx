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
import { countries } from 'src/lib/data/Countries';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

interface HomeCountryAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  homeCountry: string;
  accountListId: string;
}

export const HomeCountryAccordion: React.FC<HomeCountryAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  homeCountry,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferencesMutation] =
    useUpdateAccountPreferencesMutation();
  const label = t('Home Country');

  const selectedCountry = useMemo(
    () => countries.find(({ code }) => code === homeCountry)?.name ?? '',
    [countries, homeCountry],
  );

  const PreferencesSchema: yup.SchemaOf<
    Pick<Types.AccountListSettingsInput, 'homeCountry'>
  > = yup.object({
    homeCountry: yup.string(),
  });

  const onSubmit = async (
    attributes: Pick<Types.AccountListSettingsInput, 'homeCountry'>,
  ) => {
    await updateAccountPreferencesMutation({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            settings: {
              homeCountry: attributes.homeCountry,
            },
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
      value={selectedCountry}
      fullWidth
    >
      <Formik
        initialValues={{
          homeCountry: homeCountry,
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
        validateOnMount
      >
        {({
          values: { homeCountry },
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
                'This should be the place from which you are living and sending out physical communications. This will be used in exports for mailing address information.',
              )}
            >
              <Autocomplete
                disabled={isSubmitting}
                autoHighlight
                value={homeCountry}
                onChange={(_, value) => {
                  setFieldValue('homeCountry', value);
                }}
                options={countries.map((country) => country.code) || []}
                getOptionLabel={(homeCountry): string =>
                  countries.find(({ code }) => code === homeCountry)?.name ?? ''
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
