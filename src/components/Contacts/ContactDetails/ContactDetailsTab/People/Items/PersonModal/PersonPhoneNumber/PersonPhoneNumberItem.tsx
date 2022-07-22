import {
  Grid,
  MenuItem,
  Select,
  styled,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormikErrors, getIn } from 'formik';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import {
  InputMaybe,
  PersonCreateInput,
  PersonPhoneNumberInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';
import { NewSocial } from '../PersonModal';

interface Props {
  phoneNumber: PersonPhoneNumberInput;
  index: number;
  primaryPhoneNumber: PersonPhoneNumberInput | undefined;
  phoneNumbers: InputMaybe<PersonPhoneNumberInput[]> | undefined;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined,
  ) => void;
  errors: FormikErrors<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
  handleChangePrimary: (numberId: string) => void;
}

const ContactInputField = styled(TextField)(
  ({ destroyed }: { destroyed: boolean }) => ({
    '&& > label': {
      textTransform: 'uppercase',
    },
    textDecoration: destroyed ? 'line-through' : 'none',
  }),
);

const PhoneNumberSelect = styled(Select)(
  ({ destroyed }: { destroyed: boolean }) => ({
    textDecoration: destroyed ? 'line-through' : 'none',
  }),
);

export const PersonPhoneNumberItem: React.FC<Props> = ({
  phoneNumber,
  index,
  primaryPhoneNumber,
  phoneNumbers,
  setFieldValue,
  errors,
  handleChangePrimary,
}) => {
  const { t } = useTranslation();

  const [isPrimaryChecked, setIsPrimaryChecked] = React.useState(false);
  // React.useEffect(() => {
  //     setIsPrimaryChecked(phoneNumber.id === primaryPhoneNumber?.id);
  // }, []);

  React.useEffect(() => {
    setIsPrimaryChecked(phoneNumber.id === primaryPhoneNumber?.id);
  }, [primaryPhoneNumber]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChangePrimary(event.target.value as string);
  };

  return (
    <>
      <ModalSectionContainer key={index}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ContactInputField
              destroyed={phoneNumber.destroy ?? false}
              value={phoneNumber.number}
              onChange={(event) =>
                setFieldValue(
                  `phoneNumbers.${index}.number`,
                  event.target.value,
                )
              }
              disabled={!!phoneNumber.destroy}
              inputProps={{ 'aria-label': t('Phone Number') }}
              error={getIn(errors, `phoneNumbers.${index}`)}
              helperText={
                getIn(errors, `phoneNumbers.${index}`) &&
                getIn(errors, `phoneNumbers.${index}`).number
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PhoneNumberSelect
              destroyed={phoneNumber.destroy ?? false}
              value={phoneNumber.location ?? ''}
              onChange={(event) =>
                setFieldValue(
                  `phoneNumbers.${index}.location`,
                  event.target.value,
                )
              }
              disabled={!!phoneNumber.destroy}
              inputProps={{
                'aria-label': t('Phone Number Type'),
              }}
              fullWidth
            >
              <MenuItem selected value=""></MenuItem>
              <MenuItem value="Mobile" aria-label={t('Mobile')}>
                {t('Mobile')}
              </MenuItem>
              <MenuItem value="Work" aria-label={t('Work')}>
                {t('Work')}
              </MenuItem>
            </PhoneNumberSelect>
          </Grid>
          <ModalSectionDeleteIcon
            handleClick={
              phoneNumber.id
                ? () =>
                    setFieldValue(
                      `phoneNumbers.${index}.destroy`,
                      !phoneNumber.destroy,
                    )
                : () => {
                    const temp = phoneNumbers;
                    temp?.splice(index, 1);
                    setFieldValue('phoneNumbers', temp);
                  }
            }
          />
        </Grid>
        <FormControlLabel
          label={t('Primary')}
          control={
            <Checkbox
              value={phoneNumber.id}
              checked={isPrimaryChecked}
              onChange={handleChange}
            />
          }
        />
      </ModalSectionContainer>
    </>
  );
};
