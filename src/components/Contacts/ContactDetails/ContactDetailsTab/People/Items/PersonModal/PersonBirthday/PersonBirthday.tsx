import React from 'react';
import TextField from '@mui/material/TextField';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import CakeIcon from '@mui/icons-material/Cake';
import { FormikProps } from 'formik';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';
import { NewSocial } from '../PersonModal';

interface PersonBirthdayProps {
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
}

export const PersonBirthday: React.FC<PersonBirthdayProps> = ({
  formikProps,
}) => {
  const { t } = useTranslation();

  const {
    values: { birthdayDay, birthdayMonth, birthdayYear },
    setFieldValue,
  } = formikProps;

  const handleDateChange = (date: DateTime) => {
    setFieldValue('birthdayDay', date.day);
    setFieldValue('birthdayMonth', date.month);
    setFieldValue('birthdayYear', date.year);
  };

  return (
    <ModalSectionContainer>
      <ModalSectionIcon icon={<CakeIcon />} />
      <MobileDatePicker
        renderInput={(params) => (
          <TextField
            fullWidth
            helperText="mm/dd/yyyy"
            inputProps={{ 'aria-label': t('Birthday') }}
            {...params}
          />
        )}
        onChange={(date) => (!date ? null : handleDateChange(date))}
        value={
          birthdayMonth && birthdayDay
            ? new Date(birthdayYear ?? 1900, birthdayMonth - 1, birthdayDay)
            : null
        }
        inputFormat="MM/dd/yyyy"
        label={t('Birthday')}
      />
    </ModalSectionContainer>
  );
};
