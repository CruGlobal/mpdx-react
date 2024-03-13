import React from 'react';
import CakeIcon from '@mui/icons-material/Cake';
import { FormikProps } from 'formik';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
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
      <ModalSectionIcon transform="translateY(-100%)" icon={<CakeIcon />} />
      <CustomDateField
        label={t('Birthday')}
        value={
          birthdayMonth && birthdayDay
            ? DateTime.local(birthdayYear ?? 1900, birthdayMonth, birthdayDay)
            : null
        }
        onChange={(date) => handleDateChange(date)}
      />
    </ModalSectionContainer>
  );
};
