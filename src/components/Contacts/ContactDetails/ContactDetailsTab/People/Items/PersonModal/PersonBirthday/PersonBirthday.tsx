import React from 'react';
import CakeIcon from '@mui/icons-material/Cake';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import { FormikProps } from 'formik';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import { NewSocial } from '../PersonModal';

interface PersonBirthdayProps {
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
}

export const PersonBirthday: React.FC<PersonBirthdayProps> = ({
  formikProps,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const {
    values: { birthdayDay, birthdayMonth, birthdayYear },
    setFieldValue,
  } = formikProps;

  const handleDateChange = (date: DateTime | null) => {
    setFieldValue('birthdayDay', date?.day || null);
    setFieldValue('birthdayMonth', date?.month || null);
    setFieldValue('birthdayYear', date?.year || null);
  };

  return (
    <ModalSectionContainer>
      <ModalSectionIcon icon={<CakeIcon />} />
      <DatePicker<Date, DateTime>
        renderInput={(params) => (
          <TextField
            fullWidth
            helperText={getDateFormatPattern(locale).toLowerCase()}
            inputProps={{ 'aria-label': t('Birthday') }}
            {...params}
          />
        )}
        onChange={(date) => handleDateChange(date)}
        value={
          birthdayMonth && birthdayDay
            ? new Date(birthdayYear ?? 1900, birthdayMonth - 1, birthdayDay)
            : null
        }
        inputFormat={getDateFormatPattern(locale)}
        label={t('Birthday')}
        componentsProps={{
          actionBar: {
            actions: ['cancel', 'clear'],
          },
        }}
      />
    </ModalSectionContainer>
  );
};
