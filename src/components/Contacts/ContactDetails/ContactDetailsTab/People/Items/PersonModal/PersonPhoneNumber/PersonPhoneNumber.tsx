import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  styled,
  TextField,
  Typography,
} from '@material-ui/core';
import React from 'react';
import AddIcon from '@material-ui/icons/Add';
import { useTranslation } from 'react-i18next';
import { FormikProps, FieldArray, getIn } from 'formik';
import { Phone } from '@material-ui/icons';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';
import { NewSocial } from '../PersonModal';

const ContactPrimaryPersonSelectLabel = styled(InputLabel)(() => ({
  textTransform: 'uppercase',
}));

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

const ContactAddIcon = styled(AddIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

const ContactAddText = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

interface PersonPhoneNumberProps {
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
}

export const PersonPhoneNumber: React.FC<PersonPhoneNumberProps> = ({
  formikProps,
}) => {
  const { t } = useTranslation();

  const {
    values: { phoneNumbers },
    setFieldValue,
    errors,
  } = formikProps;

  const primaryPhoneNumber = phoneNumbers?.filter(
    (phoneNumber) => phoneNumber.primary,
  )[0];

  const handleChangePrimary = (numberId: string) => {
    const index = phoneNumbers?.findIndex(
      (phoneNumber) => phoneNumber.id === numberId,
    );
    const primaryIndex = phoneNumbers?.findIndex(
      (phoneNumber) => phoneNumber.id === primaryPhoneNumber?.id,
    );
    setFieldValue(`phoneNumbers.${index}.primary`, true);
    setFieldValue(`phoneNumbers.${primaryIndex}.primary`, false);
  };

  return (
    <>
      {phoneNumbers ? (
        <>
          {phoneNumbers.length > 0 && primaryPhoneNumber && (
            <ModalSectionContainer>
              <ModalSectionIcon icon={<Phone />} />

              <FormControl fullWidth={true}>
                <ContactPrimaryPersonSelectLabel id="primary-phone-number-label">
                  {t('Primary Phone')}
                </ContactPrimaryPersonSelectLabel>
                <Select
                  id="primary-phone-number-label"
                  value={primaryPhoneNumber?.id}
                  onChange={(event) =>
                    handleChangePrimary(event.target.value as string)
                  }
                >
                  {phoneNumbers.map(
                    (phoneNumber) =>
                      phoneNumber.id && (
                        <MenuItem key={phoneNumber.id} value={phoneNumber.id}>
                          {phoneNumber.number}
                        </MenuItem>
                      ),
                  )}
                </Select>
              </FormControl>
            </ModalSectionContainer>
          )}
          <FieldArray
            name="phoneNumbers"
            render={({ push }) => (
              <>
                {phoneNumbers?.map((phoneNumber, index) => (
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
                                  temp.splice(index, 1);
                                  setFieldValue('phoneNumbers', temp);
                                }
                          }
                        />
                      </Grid>
                    </ModalSectionContainer>
                  </>
                ))}
                <ModalSectionContainer>
                  <Grid container alignItems="center">
                    <Button>
                      <ContactAddIcon />
                      <ContactAddText
                        variant="subtitle1"
                        onClick={() =>
                          push({
                            number: '',
                            location: '',
                            destroy: false,
                          })
                        }
                      >
                        {t('Add Phone')}
                      </ContactAddText>
                    </Button>
                  </Grid>
                </ModalSectionContainer>
              </>
            )}
          />
        </>
      ) : null}
    </>
  );
};
