import {
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
import BookmarkIcon from '@material-ui/icons/Bookmark';
import AddIcon from '@material-ui/icons/Add';
import { useTranslation } from 'react-i18next';
import { FormikProps, FieldArray, getIn } from 'formik';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import { PersonUpdateInput } from '../../../../../../../../../graphql/types.generated';

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

const ContactAddIcon = styled(AddIcon)(() => ({
  color: '#2196F3',
}));

const ContactAddText = styled(Typography)(() => ({
  color: '#2196F3',
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

interface PersonPhoneNumberProps {
  formikProps: FormikProps<PersonUpdateInput>;
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
      {phoneNumbers && phoneNumbers.length > 0 ? (
        <>
          <ModalSectionContainer>
            <ModalSectionIcon icon={<BookmarkIcon />} />

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
          <FieldArray
            name="phoneNumbers"
            render={() => (
              <>
                {phoneNumbers?.map((phoneNumber, index) => (
                  <>
                    <ModalSectionContainer key={index}>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
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
                        <Grid item xs={6}>
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
                            <MenuItem value="Mobile" aria-label={t('Mobile')}>
                              {t('Mobile')}
                            </MenuItem>
                            <MenuItem value="Work" aria-label={t('Work')}>
                              {t('Work')}
                            </MenuItem>
                          </PhoneNumberSelect>
                        </Grid>
                        <ModalSectionDeleteIcon
                          handleClick={() =>
                            setFieldValue(
                              `phoneNumbers.${index}.destroy`,
                              !phoneNumber.destroy,
                            )
                          }
                        />
                      </Grid>
                    </ModalSectionContainer>
                  </>
                ))}
              </>
            )}
          />
        </>
      ) : null}
      <ModalSectionContainer>
        <Grid container alignItems="center">
          <ContactAddIcon />
          <ContactAddText variant="subtitle1">{t('Add Phone')}</ContactAddText>
        </Grid>
      </ModalSectionContainer>
    </>
  );
};
