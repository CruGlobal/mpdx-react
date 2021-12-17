import {
  Checkbox,
  FormControl,
  FormControlLabel,
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
import { FieldArray, FormikProps, getIn } from 'formik';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionDeleteIcon } from '../ModalSectionDeleteIcon/ModalSectionDeleteIcon';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';

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

const EmailSelect = styled(Select)(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

const ContactAddIcon = styled(AddIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

const ContactAddText = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

const OptOutENewsletterLabel = styled(FormControlLabel)(() => ({
  margin: 'none',
}));

interface PersonEmailProps {
  formikProps: FormikProps<PersonUpdateInput | PersonCreateInput>;
}

export const PersonEmail: React.FC<PersonEmailProps> = ({ formikProps }) => {
  const { t } = useTranslation();

  const {
    values: { emailAddresses, optoutEnewsletter },
    setFieldValue,
    errors,
  } = formikProps;
  const primaryEmail = emailAddresses?.filter(
    (emailAddress) => emailAddress.primary,
  )[0];

  const handleChangePrimary = (emailId: string) => {
    const index = emailAddresses?.findIndex((email) => email.id === emailId);
    const primaryIndex = emailAddresses?.findIndex(
      (email) => email.id === primaryEmail?.id,
    );
    setFieldValue(`emailAddresses.${index}.primary`, true);
    setFieldValue(`emailAddresses.${primaryIndex}.primary`, false);
  };

  return (
    <>
      {emailAddresses ? (
        <>
          {emailAddresses.length > 0 && primaryEmail && (
            <ModalSectionContainer>
              <ModalSectionIcon icon={<BookmarkIcon />} />

              <FormControl fullWidth={true}>
                <ContactPrimaryPersonSelectLabel id="primary-email-label">
                  {t('Primary Email')}
                </ContactPrimaryPersonSelectLabel>
                <Select
                  id="primary-email-label"
                  value={primaryEmail?.id}
                  onChange={(event) =>
                    handleChangePrimary(event.target.value as string)
                  }
                >
                  {emailAddresses.map(
                    (emailAddress) =>
                      emailAddress.id && (
                        <MenuItem key={emailAddress.id} value={emailAddress.id}>
                          {emailAddress.email}
                        </MenuItem>
                      ),
                  )}
                </Select>
              </FormControl>
            </ModalSectionContainer>
          )}
          <FieldArray
            name="emailAddresses"
            render={({ push }) => (
              <>
                {emailAddresses?.map((emailAddress, index) => (
                  <>
                    <ModalSectionContainer key={index}>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <ContactInputField
                            destroyed={emailAddress.destroy ?? false}
                            value={emailAddress.email}
                            onChange={(event) =>
                              setFieldValue(
                                `emailAddresses.${index}.email`,
                                event.target.value,
                              )
                            }
                            disabled={!!emailAddress.destroy}
                            inputProps={{ 'aria-label': t('Email Address') }}
                            error={getIn(errors, `emailAddresses.${index}`)}
                            helperText={
                              getIn(errors, `emailAddresses.${index}`) &&
                              getIn(errors, `emailAddresses.${index}`).email
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <EmailSelect
                            destroyed={emailAddress.destroy ?? false}
                            value={emailAddress.location ?? ''}
                            onChange={(event) =>
                              setFieldValue(
                                `emailAddresses.${index}.location`,
                                event.target.value,
                              )
                            }
                            disabled={!!emailAddress.destroy}
                            inputProps={{
                              'aria-label': t('Email Address Type'),
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
                          </EmailSelect>
                        </Grid>
                        <ModalSectionDeleteIcon
                          handleClick={() =>
                            setFieldValue(
                              `emailAddresses.${index}.destroy`,
                              !emailAddress.destroy,
                            )
                          }
                        />
                      </Grid>
                    </ModalSectionContainer>
                  </>
                ))}
                <ModalSectionContainer>
                  <Grid container alignItems="center">
                    <Grid container alignItems="center" item xs={6}>
                      <ContactAddIcon />
                      <ContactAddText
                        variant="subtitle1"
                        onClick={() =>
                          push({
                            email: '',
                            location: '',
                            destroy: false,
                          })
                        }
                      >
                        {t('Add Email')}
                      </ContactAddText>
                    </Grid>
                    <Grid container item xs={6} alignItems="center">
                      <OptOutENewsletterLabel
                        control={
                          <Checkbox
                            checked={!!optoutEnewsletter}
                            onChange={() =>
                              setFieldValue(
                                'optoutEnewsletter',
                                !optoutEnewsletter,
                              )
                            }
                          />
                        }
                        label={t('Opt-out of Email Newsletter')}
                      />
                    </Grid>
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
