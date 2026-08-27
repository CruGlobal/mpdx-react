import { ReactElement, useMemo } from 'react';
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
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { AccordionProps } from '../../../accordionHelper';
import { useUpdateAccountPreferencesMutation } from '../UpdateAccountPreferences.generated';

const accountPreferencesSchema: yup.ObjectSchema<
  Pick<AccountListSettingsInput, 'geographicLocation'>
> = yup.object({
  geographicLocation: yup.string().nullable(),
});

interface GeographicLocationAccordionProps
  extends AccordionProps<PreferenceAccordion> {
  geographicLocation: string;
  accountListId: string;
  disabled?: boolean;
  handleSetupChange: () => Promise<void>;
}

export const GeographicLocationAccordion: React.FC<
  GeographicLocationAccordionProps
> = ({
  handleAccordionChange,
  expandedAccordion,
  geographicLocation,
  accountListId,
  disabled,
  handleSetupChange,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();
  const label = t('Geographic Location');

  const { goalGeographicConstantMap } = useGoalCalculatorConstants();
  const locations = useMemo(
    () => Array.from(goalGeographicConstantMap.keys()),
    [goalGeographicConstantMap],
  );

  const onSubmit = async (
    attributes: Pick<AccountListSettingsInput, 'geographicLocation'>,
  ) => {
    await updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            settings: { geographicLocation: attributes.geographicLocation },
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
      accordion={PreferenceAccordion.GeographicLocation}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={label}
      value={geographicLocation}
      fullWidth
      disabled={disabled}
    >
      <Formik
        initialValues={{ geographicLocation: geographicLocation }}
        validationSchema={accountPreferencesSchema}
        onSubmit={onSubmit}
        enableReinitialize
        validateOnMount
      >
        {({
          values: { geographicLocation },
          handleSubmit,
          isSubmitting,
          isValid,
          setFieldValue,
        }): ReactElement => (
          <FormWrapper
            onSubmit={handleSubmit}
            isValid={isValid}
            isSubmitting={isSubmitting}
          >
            <FieldWrapper
              helperText={t(
                'This should be the major city within 50 miles of you. If none apply, leave this blank.',
              )}
            >
              <Autocomplete
                options={locations}
                value={geographicLocation || null}
                onChange={(_, location) =>
                  setFieldValue('geographicLocation', location)
                }
                disabled={isSubmitting}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={label}
                    placeholder={label}
                    sx={{ marginTop: 1 }}
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
