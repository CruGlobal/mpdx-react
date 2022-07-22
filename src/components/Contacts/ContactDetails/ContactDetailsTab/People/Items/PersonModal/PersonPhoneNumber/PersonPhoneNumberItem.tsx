import { Grid, MenuItem, Select, styled, TextField } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormikProps, getIn } from 'formik';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import {
  PersonCreateInput,
  PersonPhoneNumberInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';
import { NewSocial } from '../PersonModal';

interface Props {
  phoneNumber: PersonPhoneNumberInput;
  index: number;
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
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
  formikProps,
}) => {
  const { t } = useTranslation();
  const {
    values: { phoneNumbers },
    setFieldValue,
    errors,
  } = formikProps;
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
      </ModalSectionContainer>
    </>
  );
};
