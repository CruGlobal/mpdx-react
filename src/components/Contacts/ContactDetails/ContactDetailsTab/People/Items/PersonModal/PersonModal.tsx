import React, { ReactElement, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  styled,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import _ from 'lodash';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../../../ContactDetailsTab.generated';
import Modal from '../../../../../../common/Modal/Modal';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../../../../../graphql/types.generated';
import { DeleteButton } from '../../../Mailing/EditContactAddressModal/EditContactAddressModal';
import { PersonName } from './PersonName/PersonName';
import { PersonPhoneNumber } from './PersonPhoneNumber/PersonPhoneNumber';
import { PersonEmail } from './PersonEmail/PersonEmail';
import { PersonBirthday } from './PersonBirthday/PersonBirthday';
import { PersonShowMore } from './PersonShowMore/PersonShowMore';
import {
  useCreatePersonMutation,
  useDeletePersonMutation,
  useUpdatePersonMutation,
} from './PersonModal.generated';

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

const ContactEditModalFooterButton = styled(Button)(({ theme }) => ({
  color: theme.palette.info.main,
  fontWeight: 'bold',
}));

const ShowExtraText = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
  textTransform: 'uppercase',
  fontWeight: 'bold',
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface PersonModalProps {
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

export const PersonModal: React.FC<PersonModalProps> = ({
  person,
  contactId,
  accountListId,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [personEditShowMore, setPersonEditShowMore] = useState(false);
  const [updatePerson, { loading: updating }] = useUpdatePersonMutation();
  const [createPerson, { loading: creating }] = useCreatePersonMutation();
  const [deletePerson, { loading: deleting }] = useDeletePersonMutation();

  // grabbed from https://stackoverflow.com/a/62039270
  const phoneRegex = RegExp(
    /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  );

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
        number: yup
          .string()
          .matches(phoneRegex, t('Invalid phone number'))
          .required(t('This field is required')),
        destroy: yup.boolean().default(false),
        primary: yup.boolean().default(false),
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
    optoutEnewsletter: yup.boolean().default(false),
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
    deceased: yup.boolean().default(false),
  });

  const personPhoneNumbers = person?.phoneNumbers.nodes.map((phoneNumber) => {
    return {
      id: phoneNumber.id,
      primary: phoneNumber.primary,
      number: phoneNumber.number,
      location: phoneNumber.location,
      destroy: false,
    };
  });

  const personEmails = person?.emailAddresses.nodes.map((emailAddress) => {
    return {
      id: emailAddress.id,
      primary: emailAddress.primary,
      email: emailAddress.email,
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

  const initialPerson: (PersonCreateInput | PersonUpdateInput) &
    NewSocial = person
    ? {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        title: person.title,
        suffix: person.suffix,
        phoneNumbers: personPhoneNumbers,
        emailAddresses: personEmails,
        optoutEnewsletter: person.optoutEnewsletter,
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
        deceased: person.deceased,
        newSocials: [],
      }
    : {
        contactId,
        id: null,
        firstName: '',
        lastName: null,
        title: null,
        suffix: null,
        phoneNumbers: [],
        emailAddresses: [],
        optoutEnewsletter: false,
        birthdayDay: null,
        birthdayMonth: null,
        birthdayYear: null,
        maritalStatus: null,
        gender: 'Male',
        anniversaryDay: null,
        anniversaryMonth: null,
        anniversaryYear: null,
        almaMater: null,
        employer: null,
        occupation: null,
        facebookAccounts: [],
        twitterAccounts: [],
        linkedinAccounts: [],
        websites: [],
        legalFirstName: null,
        deceased: false,
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
      await updatePerson({
        variables: {
          accountListId,
          attributes,
        },
      });
      enqueueSnackbar(t('Person updated successfully'), {
        variant: 'success',
      });
    } else {
      await createPerson({
        variables: {
          accountListId,
          attributes,
        },
        update: (cache, { data: createdContactData }) => {
          const query = {
            query: ContactDetailsTabDocument,
            variables: {
              accountListId,
              contactId,
            },
          };
          const dataFromCache = cache.readQuery<ContactDetailsTabQuery>(query);

          if (dataFromCache) {
            const data = {
              ...dataFromCache,
              contact: {
                ...dataFromCache.contact,
                people: {
                  ...dataFromCache.contact.people,
                  nodes: [
                    ...dataFromCache.contact.people.nodes,
                    { ...createdContactData?.createPerson?.person },
                  ],
                },
              },
            };
            cache.writeQuery({ ...query, data });
          }
          enqueueSnackbar(t('Person created successfully'), {
            variant: 'success',
          });
        },
      });
    }
    handleClose();
  };

  const deletePersonFromContact = async (): Promise<void> => {
    if (person) {
      await deletePerson({
        variables: {
          id: person.id,
          accountListId,
        },
        refetchQueries: [
          {
            query: ContactDetailsTabDocument,
            variables: { accountListId, contactId },
          },
        ],
      });
    }
  };

  return (
    <Modal
      isOpen={true}
      title={person ? t('Edit Person') : t('Create Person')}
      handleClose={handleClose}
    >
      <Formik
        initialValues={initialPerson}
        validationSchema={personSchema}
        onSubmit={onSubmit}
      >
        {(formikProps): ReactElement => (
          <form onSubmit={formikProps.handleSubmit} noValidate>
            <DialogContent dividers>
              <ContactEditContainer>
                <ContactPersonContainer>
                  {/* Name Section */}
                  <PersonName person={person} formikProps={formikProps} />
                  {/* Phone Number Section */}
                  <PersonPhoneNumber formikProps={formikProps} />
                  {/* Email Section */}
                  <PersonEmail formikProps={formikProps} />
                  {/* Birthday Section */}
                  <PersonBirthday formikProps={formikProps} />
                  {/* Show More Section */}
                  {!personEditShowMore && (
                    <ShowExtraContainer>
                      <Button>
                        <ShowExtraText
                          variant="subtitle1"
                          onClick={() => setPersonEditShowMore(true)}
                        >
                          {t('Show More')}
                        </ShowExtraText>
                      </Button>
                    </ShowExtraContainer>
                  )}
                  {/* Start Show More Content */}
                  {personEditShowMore ? (
                    <PersonShowMore formikProps={formikProps} />
                  ) : null}
                  {/* End Show More Content */}

                  {/* Show Less Section */}
                  {personEditShowMore && (
                    <ShowExtraContainer>
                      <Button>
                        <ShowExtraText
                          variant="subtitle1"
                          onClick={() => setPersonEditShowMore(false)}
                        >
                          {t('Show Less')}
                        </ShowExtraText>
                      </Button>
                    </ShowExtraContainer>
                  )}
                </ContactPersonContainer>
              </ContactEditContainer>
            </DialogContent>
            <DialogActions>
              <Box
                justifyContent={person ? 'space-between' : 'end'}
                display="flex"
                alignItems="center"
                width="100%"
              >
                {person && (
                  <DeleteButton
                    onClick={deletePersonFromContact}
                    variant="text"
                  >
                    {t('Delete')}
                  </DeleteButton>
                )}
                <Box>
                  <ContactEditModalFooterButton
                    onClick={handleClose}
                    variant="text"
                  >
                    {t('Cancel')}
                  </ContactEditModalFooterButton>
                  <ContactEditModalFooterButton
                    type="submit"
                    disabled={!formikProps.isValid || formikProps.isSubmitting}
                    variant="text"
                  >
                    {(updating || creating || deleting) && (
                      <LoadingIndicator color="primary" size={20} />
                    )}
                    {t('Save')}
                  </ContactEditModalFooterButton>
                </Box>
              </Box>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
