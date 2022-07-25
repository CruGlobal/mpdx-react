import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  styled,
  Typography,
} from '@material-ui/core';
import React from 'react';

import AddIcon from '@material-ui/icons/Add';
import { useTranslation } from 'react-i18next';
import { FieldArray, FormikProps } from 'formik';
import { Mail } from '@material-ui/icons';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';
import { NewSocial } from '../PersonModal';
import { PersonEmailItem } from './PersonEmailItem';

const ContactPrimaryPersonSelectLabel = styled(InputLabel)(() => ({
  textTransform: 'uppercase',
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
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
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
              <ModalSectionIcon icon={<Mail />} />

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
                    <span key={index} />
                    <PersonEmailItem
                      emailAddress={emailAddress}
                      index={index}
                      emailAddresses={emailAddresses}
                      setFieldValue={setFieldValue}
                      errors={errors}
                      handleChangePrimary={handleChangePrimary}
                      primaryEmail={primaryEmail}
                    />
                  </>
                ))}
                <ModalSectionContainer>
                  <Grid container alignItems="center">
                    <Grid container alignItems="center" item xs={6}>
                      <Button>
                        <ContactAddIcon />
                        <ContactAddText
                          variant="subtitle1"
                          aria-label={t('Add Email Address')}
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
                      </Button>
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
