import React from 'react';
import { DatePicker } from '@material-ui/pickers';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import CakeIcon from '@material-ui/icons/Cake';
import { FormikProps } from 'formik';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import { PersonUpdateInput } from '../../../../../../../../../graphql/types.generated';

interface PersonBirthdayProps {
  formikProps: FormikProps<PersonUpdateInput>;
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
      <DatePicker
        onChange={(date) => (!date ? null : handleDateChange(date))}
        value={
          birthdayMonth && birthdayDay
            ? new Date(birthdayYear ?? 1900, birthdayMonth - 1, birthdayDay)
            : null
        }
        format="MM/dd/yyyy"
        clearable
        label={t('Birthday')}
        fullWidth
        helperText="mm/dd/yyyy"
      />
    </ModalSectionContainer>
  );
};
