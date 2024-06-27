import React, { useEffect, useMemo, useState } from 'react';
import CakeIcon from '@mui/icons-material/Cake';
import { FormikProps } from 'formik';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { validateAndFormatInvalidDate } from 'src/lib/intlFormat';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import { NewSocial } from '../PersonModal';
import { buildDate } from '../personModalHelper';

interface PersonBirthdayProps {
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
}

export const PersonBirthday: React.FC<PersonBirthdayProps> = ({
  formikProps,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [birthdayDateIsInvalid, setBirthdayDateIsInvalid] = useState(false);
  const [backupBirthdayDate, setBackupBirthdayDate] =
    useState<DateTime<boolean> | null>(null);

  const {
    values: { birthdayDay, birthdayMonth, birthdayYear },
    setFieldValue,
  } = formikProps;

  useEffect(() => {
    if (typeof birthdayMonth !== 'number' || typeof birthdayDay !== 'number') {
      return;
    }

    const date = validateAndFormatInvalidDate(
      birthdayYear,
      birthdayMonth,
      birthdayDay,
      locale,
    );

    setBackupBirthdayDate(
      date.formattedInvalidDate as unknown as DateTime<boolean>,
    );
    if (date.dateTime.invalidExplanation) {
      setBirthdayDateIsInvalid(true);
    }
  }, [birthdayMonth, birthdayDay, birthdayYear]);

  const handleDateChange = (date: DateTime | null) => {
    setFieldValue('birthdayDay', date?.day ?? null);
    setFieldValue('birthdayMonth', date?.month ?? null);
    setFieldValue('birthdayYear', date?.year ?? null);
  };

  const birthdayDate = useMemo(
    () => buildDate(birthdayMonth, birthdayDay, birthdayYear),
    [birthdayMonth, birthdayDay, birthdayYear],
  );

  return (
    <ModalSectionContainer>
      <ModalSectionIcon transform="translateY(-100%)" icon={<CakeIcon />} />
      <CustomDateField
        label={t('Birthday')}
        invalidDate={birthdayDateIsInvalid}
        value={birthdayDateIsInvalid ? backupBirthdayDate : birthdayDate}
        onChange={(date) => handleDateChange(date)}
      />
    </ModalSectionContainer>
  );
};
