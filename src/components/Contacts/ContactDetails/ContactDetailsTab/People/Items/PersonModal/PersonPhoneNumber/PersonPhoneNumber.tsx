import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Phone from '@mui/icons-material/Phone';
import { Button, Grid, InputLabel, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FieldArray, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import { NewSocial } from '../PersonModal';
import { PersonPhoneNumberItem } from './PersonPhoneNumberItem';

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

interface PersonPhoneNumberProps {
  formikProps: FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;
  sources:
    | {
        id: string;
        source: string;
      }[]
    | undefined;
}

export const PersonPhoneNumber: React.FC<PersonPhoneNumberProps> = ({
  formikProps,
  sources,
}) => {
  const { t } = useTranslation();

  const {
    values: { phoneNumbers },
    setFieldValue,
    errors,
    setFieldError,
  } = formikProps;

  const [primaryIndex, setPrimaryIndex] = useState(0);

  const primaryPhoneNumber = phoneNumbers?.filter(
    (phoneNumber) => phoneNumber.primary,
  )[0];

  const handleChangePrimary = (index: number) => {
    setFieldValue(`phoneNumbers.${primaryIndex}.primary`, false);
    setFieldValue(`phoneNumbers.${index}.primary`, true);
    setPrimaryIndex(index);
  };

  ///todo make primary index a state
  useEffect(() => {
    if (!phoneNumbers) {
      return;
    }
    setPrimaryIndex(
      phoneNumbers?.findIndex(
        (phoneNumber) => phoneNumber.id === primaryPhoneNumber?.id,
      ) ?? 0,
    );
    phoneNumbers.forEach((phoneNumber, idx) => {
      if (phoneNumber.number === null) {
        setFieldError(
          `phoneNumbers.${idx}.number`,
          t('Please enter a valid phone number'),
        );
      }
    });
  }, []);

  return phoneNumbers ? (
    <>
      {phoneNumbers.length > 0 && (
        <ModalSectionContainer>
          <ModalSectionIcon icon={<Phone />} />
          <ContactPrimaryPersonSelectLabel id="primary-phone-number-label">
            {t('Phone Numbers')}
          </ContactPrimaryPersonSelectLabel>
        </ModalSectionContainer>
      )}
      <FieldArray
        name="phoneNumbers"
        render={({ push }) => (
          <>
            {phoneNumbers?.map((phoneNumber, index) => (
              <React.Fragment key={index}>
                <PersonPhoneNumberItem
                  phoneNumber={phoneNumber}
                  index={index}
                  primaryIndex={primaryIndex}
                  phoneNumbers={phoneNumbers}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  handleChangePrimary={handleChangePrimary}
                  sources={sources}
                />
              </React.Fragment>
            ))}
            <ModalSectionContainer>
              <Grid container alignItems="center">
                <Button>
                  <ContactAddIcon />
                  <ContactAddText
                    variant="subtitle1"
                    aria-label={t('Add Phone Number')}
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
  ) : null;
};
