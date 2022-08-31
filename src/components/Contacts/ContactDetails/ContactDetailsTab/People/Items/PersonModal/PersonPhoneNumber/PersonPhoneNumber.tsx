import { Button, Grid, InputLabel, styled, Typography } from '@mui/material';
import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { FormikProps, FieldArray } from 'formik';
import { Phone } from '@mui/icons-material';
import { ModalSectionContainer } from '../ModalSectionContainer/ModalSectionContainer';
import { ModalSectionIcon } from '../ModalSectionIcon/ModalSectionIcon';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../../../../../../graphql/types.generated';
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
                  <>
                    <span key={index} />
                    <PersonPhoneNumberItem
                      phoneNumber={phoneNumber}
                      index={index}
                      primaryPhoneNumber={primaryPhoneNumber}
                      phoneNumbers={phoneNumbers}
                      setFieldValue={setFieldValue}
                      errors={errors}
                      handleChangePrimary={handleChangePrimary}
                    />
                  </>
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
      ) : null}
    </>
  );
};
