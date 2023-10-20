import React, { ReactElement } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Autocomplete, TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import * as Types from '../../../../../../graphql/types.generated';
import { useUpdateTimeZonePreferenceMutation } from './UpdateTimeZone.generated';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import {
  GetPersonalPreferencesQuery,
  GetPersonalPreferencesDocument,
} from '../../GetPersonalPreferences.generated';
import { timeZones } from './TimeZones';

interface TimeZoneAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  data: GetPersonalPreferencesQuery['user'] | undefined;
  accountListId: string;
}

export const TimeZoneAccordion: React.FC<TimeZoneAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  data,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateTimeZonePreference] = useUpdateTimeZonePreferenceMutation();
  const label = 'Time Zone';

  const PreferencesSchema: yup.SchemaOf<Pick<Types.Preference, 'timeZone'>> =
    yup.object({
      timeZone: yup.string().required(),
    });

  const onSubmit = async (attributes: Pick<Types.Preference, 'timeZone'>) => {
    await updateTimeZonePreference({
      variables: {
        input: {
          attributes: {
            timeZone: attributes.timeZone,
          },
        },
      },
      update: (cache) => {
        cache.updateQuery(
          {
            query: GetPersonalPreferencesDocument,
            variables: {
              accountListId,
            },
          },
          (data) => {
            return {
              user: {
                ...data.user,
                preferences: {
                  ...data.user.preferences,
                  timeZone: attributes.timeZone,
                },
              },
              accountList: data.accountList,
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
      value={data?.preferences?.timeZone || ''}
      fullWidth={true}
    >
      <Formik
        initialValues={{
          timeZone: data?.preferences?.timeZone || '',
        }}
        validationSchema={PreferencesSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { timeZone },
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
                  'The timezone will be used in setting tasks, appointments, completion dates, etc. Please make sure it matches the one your computer is set to.',
                )}
              >
                <Autocomplete
                  autoSelect
                  disabled={isSubmitting}
                  autoHighlight
                  loading={loading}
                  value={timeZone}
                  onChange={(_, value) => {
                    setFieldValue('timeZone', value);
                  }}
                  options={timeZones.map((zone) => zone.key) || []}
                  getOptionLabel={(timeZone): string =>
                    timeZones.find(
                      ({ key }) => String(key) === String(timeZone),
                    )?.value ?? ''
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
