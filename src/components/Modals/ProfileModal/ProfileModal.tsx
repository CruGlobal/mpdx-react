import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../graphql/types.generated';
import React, { ReactElement, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useApolloClient } from '@apollo/client';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import _ from 'lodash';
import { ContactDetailsTabQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/ContactDetailsTab.generated';
import Modal from 'src/components/common/Modal/Modal';
import { PersonName } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonName/PersonName';
import { PersonPhoneNumber } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonPhoneNumber/PersonPhoneNumber';
import { PersonEmail } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonEmail/PersonEmail';
import { PersonBirthday } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonBirthday/PersonBirthday';
import { PersonShowMore } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonShowMore/PersonShowMore';
//import { useUpdatePersonMutation } from './PersonModal.generated';
// import {
//   ContactDetailContext,
//   ContactDetailsType,
// } from 'src/components/Contacts/ContactDetails/ContactDetailContext';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import {
  uploadAvatar,
  validateAvatar,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/uploadAvatar';

export const ContactInputField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'destroyed',
})(({ destroyed }: { destroyed: boolean }) => ({
  // '&& > label': {
  //   textTransform: 'uppercase',
  // },
  textDecoration: destroyed ? 'line-through' : 'none',
}));

export const PrimaryControlLabel = styled(FormControlLabel, {
  shouldForwardProp: (prop) => prop !== 'destroyed',
})(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

const ContactPersonContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const ShowExtraContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  margin: theme.spacing(1, 0),
}));

const ContactEditContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  margin: theme.spacing(1, 0),
}));

const ShowExtraText = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface ProfileModalProps {
  person?: ContactDetailsTabQuery['contact']['people']['nodes'][0];
  contactId: string;
  accountListId: string;
  handleClose: () => void;
}

export interface NewSocial {
  newSocials: {
    value: string;
    type: 'facebook' | 'twitter' | 'linkedin' | 'website';
    destroy: boolean;
  }[];
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  person,
  //accountListId,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [personEditShowMore, setPersonEditShowMore] = useState(false);

  const client = useApolloClient();

  const [avatar, setAvatar] = useState<{ file: File; blobUrl: string } | null>(
    null,
  );
  useEffect(() => {
    return () => {
      if (avatar) {
        URL.revokeObjectURL(avatar.blobUrl);
      }
    };
  }, [avatar]);
  const updateAvatar = (file: File) => {
    const validationResult = validateAvatar({ file, t });
    if (!validationResult.success) {
      enqueueSnackbar(validationResult.message, {
        variant: 'error',
      });
      return;
    }

    if (avatar) {
      // Release the previous avatar blob
      URL.revokeObjectURL(avatar.blobUrl);
    }
    setAvatar({ file, blobUrl: URL.createObjectURL(file) });
  };

  //const [updatePerson] = useUpdatePersonMutation();

  const personSchema: yup.SchemaOf<
    Omit<PersonUpdateInput, 'familyRelationships' | 'id'>
  > = yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().nullable(),
    title: yup.string().nullable(),
    suffix: yup.string().nullable(),
    phoneNumbers: yup.array().of(
      yup.object({
        id: yup.string().nullable(),
        number: yup.string().required(t('This field is required')),
        destroy: yup.boolean().default(false),
        primary: yup.boolean().default(false),
        historic: yup.boolean().default(false),
      }),
    ),
    emailAddresses: yup.array().of(
      yup.object({
        id: yup.string().nullable(),
        email: yup
          .string()
          .email(t('Invalid email address'))
          .required(t('This field is required')),
        destroy: yup.boolean().default(false),
        primary: yup.boolean().default(false),
        historic: yup.boolean().default(false),
      }),
    ),
    facebookAccounts: yup.array().of(
      yup.object({
        id: yup.string().nullable(),
        destroy: yup.boolean().default(false),
        username: yup.string().required(),
      }),
    ),
    linkedinAccounts: yup.array().of(
      yup.object({
        id: yup.string().nullable(),
        destroy: yup.boolean().default(false),
        publicUrl: yup.string().required(),
      }),
    ),
    twitterAccounts: yup.array().of(
      yup.object({
        id: yup.string().nullable(),
        destroy: yup.boolean().default(false),
        screenName: yup.string().required(),
      }),
    ),
    websites: yup.array().of(
      yup.object({
        id: yup.string().nullable(),
        destroy: yup.boolean().default(false),
        url: yup.string().required(),
      }),
    ),
    newSocials: yup.array().of(
      yup.object({
        value: yup.string().required(),
        type: yup.string().required(),
      }),
    ),
    birthdayDay: yup.number().nullable(),
    birthdayMonth: yup.number().nullable(),
    birthdayYear: yup.number().nullable(),
    maritalStatus: yup.string().nullable(),
    gender: yup.string().nullable(),
    anniversaryDay: yup.number().nullable(),
    anniversaryMonth: yup.number().nullable(),
    anniversaryYear: yup.number().nullable(),
    almaMater: yup.string().nullable(),
    employer: yup.string().nullable(),
    occupation: yup.string().nullable(),
    legalFirstName: yup.string().nullable(),
  });

  const personPhoneNumberSources = person?.phoneNumbers.nodes.map(
    (phoneNumber) => {
      return {
        id: phoneNumber.id,
        source: phoneNumber.source,
      };
    },
  );

  const personEmailAddressSources = person?.emailAddresses.nodes.map(
    (emailAddress) => {
      return {
        id: emailAddress.id,
        source: emailAddress.source,
      };
    },
  );

  const personPhoneNumbers = person?.phoneNumbers.nodes.map((phoneNumber) => {
    return {
      id: phoneNumber.id,
      primary: phoneNumber.primary,
      number: phoneNumber.number,
      historic: phoneNumber.historic,
      location: phoneNumber.location,
      destroy: false,
    };
  });

  const personEmails = person?.emailAddresses.nodes.map((emailAddress) => {
    return {
      id: emailAddress.id,
      primary: emailAddress.primary,
      email: emailAddress.email,
      historic: emailAddress.historic,
      location: emailAddress.location,
      destroy: false,
    };
  });

  const personFacebookAccounts = person?.facebookAccounts.nodes.map(
    (account) => ({
      id: account.id,
      username: account.username,
      destroy: false,
    }),
  );

  const personTwitterAccounts = person?.twitterAccounts.nodes.map(
    (account) => ({
      id: account.id,
      screenName: account.screenName,
      destroy: false,
    }),
  );

  const personLinkedinAccounts = person?.linkedinAccounts.nodes.map(
    (account) => ({
      id: account.id,
      publicUrl: account.publicUrl,
      destroy: false,
    }),
  );

  const personWebsites = person?.websites.nodes.map((account) => ({
    id: account.id,
    url: account.url,
    destroy: false,
  }));

  const initialPerson: (PersonCreateInput | PersonUpdateInput) & NewSocial = {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    title: person.title,
    suffix: person.suffix,
    phoneNumbers: personPhoneNumbers,
    emailAddresses: personEmails,
    birthdayDay: person.birthdayDay,
    birthdayMonth: person.birthdayMonth,
    birthdayYear: person.birthdayYear,
    maritalStatus: person.maritalStatus,
    gender: person.gender,
    anniversaryDay: person.anniversaryDay,
    anniversaryMonth: person.anniversaryMonth,
    anniversaryYear: person.anniversaryYear,
    almaMater: person.almaMater,
    employer: person.employer,
    occupation: person.occupation,
    facebookAccounts: personFacebookAccounts,
    twitterAccounts: personTwitterAccounts,
    linkedinAccounts: personLinkedinAccounts,
    websites: personWebsites,
    legalFirstName: person.legalFirstName,
    newSocials: [],
  };

  const onSubmit = async (
    fields: (PersonCreateInput | PersonUpdateInput) & NewSocial,
  ): Promise<void> => {
    const { newSocials, ...existingSocials } = fields;
    const attributes: PersonCreateInput | PersonUpdateInput = {
      ...existingSocials,
      facebookAccounts: fields.facebookAccounts?.concat(
        newSocials
          .filter((social) => social.type === 'facebook' && !social.destroy)
          .map((social) => ({
            username: social.value,
          })),
      ),
      twitterAccounts: fields.twitterAccounts?.concat(
        newSocials
          .filter((social) => social.type === 'twitter' && !social.destroy)
          .map((social) => ({
            screenName: social.value,
          })),
      ),
      linkedinAccounts: fields.linkedinAccounts?.concat(
        newSocials
          .filter((social) => social.type === 'linkedin' && !social.destroy)
          .map((social) => ({
            publicUrl: social.value,
          })),
      ),
      websites: fields.websites?.concat(
        newSocials
          .filter((social) => social.type === 'website' && !social.destroy)
          .map((social) => ({
            url: social.value,
          })),
      ),
    };

    const isUpdate = (
      attributes: PersonCreateInput | PersonUpdateInput,
    ): attributes is PersonUpdateInput => !!person;

    if (isUpdate(attributes)) {
      const file = avatar?.file;
      if (file) {
        try {
          await uploadAvatar({
            personId: attributes.id,
            file,
            t,
          });
        } catch (err) {
          enqueueSnackbar(
            err instanceof Error
              ? err.message
              : t('Avatar could not be uploaded'),
            {
              variant: 'error',
            },
          );
          return;
        }
      }

      // await updatePerson({
      //   variables: {
      //     accountListId,
      //     attributes,
      //   },
      // });

      if (file) {
        // Update the contact's avatar since it is based on the primary person's avatar
        client.refetchQueries({ include: ['GetContactDetailsHeader'] });
      }

      enqueueSnackbar(t('Person updated successfully'), {
        variant: 'success',
      });
    }
    handleClose();
  };

  return (
    <Modal
      isOpen={true}
      title={t('Edit Profile')}
      size="md"
      handleClose={handleClose}
    >
      <Formik
        initialValues={initialPerson}
        validationSchema={personSchema}
        onSubmit={onSubmit}
      >
        {(formikProps): ReactElement => (
          <form onSubmit={formikProps.handleSubmit} noValidate>
            <DialogContent
              dividers
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              <ContactEditContainer>
                <ContactPersonContainer>
                  {/* Name Section */}
                  <PersonName
                    person={person}
                    formikProps={formikProps}
                    pendingAvatar={avatar?.blobUrl}
                    setAvatar={updateAvatar}
                  />
                  {/* Phone Number Section */}
                  <PersonPhoneNumber
                    formikProps={formikProps}
                    sources={personPhoneNumberSources}
                  />
                  {/* Email Section */}
                  <PersonEmail
                    formikProps={formikProps}
                    sources={personEmailAddressSources}
                    showOptOutENewsletter={false}
                  />
                  {/* Birthday Section */}
                  <PersonBirthday formikProps={formikProps} />
                  {/* Show More Section */}
                  {!personEditShowMore && (
                    <ShowExtraContainer>
                      <Button onClick={() => setPersonEditShowMore(true)}>
                        <ShowExtraText variant="subtitle1">
                          {t('Show More')}
                        </ShowExtraText>
                      </Button>
                    </ShowExtraContainer>
                  )}
                  {/* Start Show More Content */}
                  {personEditShowMore ? (
                    <PersonShowMore
                      formikProps={formikProps}
                      showDeceased={false}
                    />
                  ) : null}
                  {/* End Show More Content */}

                  {/* Show Less Section */}
                  {personEditShowMore && (
                    <ShowExtraContainer>
                      <Button onClick={() => setPersonEditShowMore(false)}>
                        <ShowExtraText variant="subtitle1">
                          {t('Show Less')}
                        </ShowExtraText>
                      </Button>
                    </ShowExtraContainer>
                  )}
                </ContactPersonContainer>
              </ContactEditContainer>
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={handleClose} />
              <SubmitButton
                disabled={!formikProps.isValid || formikProps.isSubmitting}
              >
                {formikProps.isSubmitting && (
                  <LoadingIndicator color="primary" size={20} />
                )}
                {t('Save')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
