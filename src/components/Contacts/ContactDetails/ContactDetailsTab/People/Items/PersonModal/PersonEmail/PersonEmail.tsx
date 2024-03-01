import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Mail from '@mui/icons-material/Mail';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FieldArray, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { PersonUpdateInput } from 'src/graphql/types.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
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
  showOptOutENewsletter?: boolean;
  formikProps: Pick<
    FormikProps<
      Pick<PersonUpdateInput, 'emailAddresses' | 'optoutEnewsletter'>
    >,
    'values' | 'setFieldValue' | 'errors'
  >;
  sources:
    | {
        id: string;
        source: string;
      }[]
    | undefined;
}

export const PersonEmail: React.FC<PersonEmailProps> = ({
  showOptOutENewsletter = false,
  formikProps,
  sources,
}) => {
  const { t } = useTranslation();

  const {
    values: { emailAddresses, optoutEnewsletter },
    setFieldValue,
    errors,
  } = formikProps;

  const [primaryIndex, setPrimaryIndex] = useState(0);

  const primaryEmail = emailAddresses?.filter(
    (emailAddress) => emailAddress.primary,
  )[0];

  const handleChangePrimary = (index: number) => {
    setFieldValue(`emailAddresses.${index}.primary`, true);
    setFieldValue(`emailAddresses.${primaryIndex}.primary`, false);
    setPrimaryIndex(index);
  };

  useEffect(() => {
    setPrimaryIndex(
      emailAddresses?.findIndex((email) => email.id === primaryEmail?.id) ?? 0,
    );
  }, []);

  return emailAddresses ? (
    <>
      {emailAddresses.length > 0 && primaryEmail && (
        <ModalSectionContainer>
          <ModalSectionIcon icon={<Mail />} />
          <ContactPrimaryPersonSelectLabel id="primary-email-label">
            {t('Email')}
          </ContactPrimaryPersonSelectLabel>
        </ModalSectionContainer>
      )}
      <FieldArray
        name="emailAddresses"
        render={({ push }) => (
          <>
            {emailAddresses?.map((emailAddress, index) => (
              <PersonEmailItem
                key={index}
                emailAddress={emailAddress}
                index={index}
                primaryIndex={primaryIndex}
                emailAddresses={emailAddresses}
                setFieldValue={setFieldValue}
                errors={errors}
                handleChangePrimary={handleChangePrimary}
                sources={sources}
              />
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
                  {showOptOutENewsletter && (
                    <OptOutENewsletterLabel
                      control={
                        <Checkbox
                          color="secondary"
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
                  )}
                </Grid>
              </Grid>
            </ModalSectionContainer>
          </>
        )}
      />
    </>
  ) : null;
};
