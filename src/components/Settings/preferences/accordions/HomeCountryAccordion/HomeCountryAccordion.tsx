import React, { ReactElement, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { FormWrapper } from 'src/components/Shared/Forms/FormWrapper';
import { AccountListSettingsInput } from 'src/graphql/types.generated';
import { AccordionProps } from '../../../accordionHelper';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

const preferencesSchema: yup.ObjectSchema<
  Pick<AccountListSettingsInput, 'homeCountry'>
> = yup.object({
  homeCountry: yup.string(),
});

interface HomeCountryAccordionProps
  extends AccordionProps<PreferenceAccordion> {
  homeCountry: string;
  accountListId: string;
  countries: { name: string; code: string }[];
  disabled?: boolean;
  handleSetupChange: () => Promise<void>;
}

export const HomeCountryAccordion: React.FC<HomeCountryAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  homeCountry,
  accountListId,
  countries,
  disabled,
  handleSetupChange,
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

  const onSubmit = async (
    attributes: Pick<AccountListSettingsInput, 'homeCountry'>,
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
        handleAccordionChange(null);
      },
      onError: () => {
        enqueueSnackbar(t('Saving failed.'), {
          variant: 'error',
        });
      },
    });
    handleSetupChange();
  };

  return (
    <AccordionItem
      accordion={PreferenceAccordion.HomeCountry}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={selectedCountry}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{
          homeCountry: homeCountry,
        }}
        validationSchema={preferencesSchema}
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
                options={countries.map((country) => country.code)}
                getOptionLabel={(homeCountry): string =>
                  countries.find(({ code }) => code === homeCountry)?.name ?? ''
                }
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={label}
                    label={label}
                    sx={{ marginTop: 1 }}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  />
                )}
              />
            </FieldWrapper>
          </FormWrapper>
        )}
      </Formik>
    </AccordionItem>
  );
};
