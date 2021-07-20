import React from 'react';
import { DatePicker } from '@material-ui/pickers';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import CakeIcon from '@material-ui/icons/Cake';
import { ContactDetailsTabQuery } from '../../../../ContactDetailsTab.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';

interface PersonBirthdayProps {
  person: ContactDetailsTabQuery['contact']['people']['nodes'][0];
}

export const PersonBirthday: React.FC<PersonBirthdayProps> = ({ person }) => {
  const { t } = useTranslation();

  const handleDateChange = (date: DateTime) => {
    console.log(date.month);
    console.log(date.day);
    console.log(date.year);
  };

  return (
    <ModalSectionContainer>
      <ModalSectionIcon icon={<CakeIcon />} />
      <DatePicker
        onChange={(date) => (!date ? null : handleDateChange(date))}
        value={
          person?.birthdayMonth && person?.birthdayDay
            ? new Date(
                person.birthdayYear ?? 1900,
                person.birthdayMonth - 1,
                person.birthdayDay,
              )
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
