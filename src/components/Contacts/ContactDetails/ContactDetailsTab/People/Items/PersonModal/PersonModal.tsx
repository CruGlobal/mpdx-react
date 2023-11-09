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
import { useSnackbar } from 'notistack';
import _ from 'lodash';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../../../ContactDetailsTab.generated';
import { ContactPeopleFragment } from '../../ContactPeople.generated';
import Modal from '../../../../../../common/Modal/Modal';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from '../../../../../../../../graphql/types.generated';
import { DeleteConfirmation } from '../../../../../../../../src/components/common/Modal/DeleteConfirmation/DeleteConfirmation';
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
import { useEditMailingInfoMutation } from '../../../Mailing/EditMailingInfoModal/EditMailingInfoModal.generated';
import {
  SubmitButton,
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { uploadAvatar, validateAvatar } from './uploadAvatar';
import { getPersonSchema, formatSubmittedFields } from './personModalHelper';
import { useUpdateUserMutation } from 'src/components/Settings/preferences/UpdateUser.generated';
//import { profile2 } from 'src/components/Settings/preferences/DemoContent';
import {
  GetContactDetailsHeaderDocument,
  GetContactDetailsHeaderQuery,
} from '../../../../ContactDetailsHeader/ContactDetailsHeader.generated';

export const ContactInputField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'destroyed',
})(({ destroyed }: { destroyed: boolean }) => ({
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

interface PersonModalProps {
  person?: ContactDetailsTabQuery['contact']['people']['nodes'][0];
  contactId: string;
  accountListId: string;
  handleClose: () => void;
  userProfile?: boolean;
  contactData?: ContactPeopleFragment;
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
  userProfile = false,
  contactData,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [personEditShowMore, setPersonEditShowMore] = useState(false);
  const [removeDialogOpen, handleRemoveDialogOpen] = useState(false);

  const client = useApolloClient();

  //console.log('person/user: ', person);
  // TODO
  // if (userProfile)
  //   person =
  //     profile2 as ContactDetailsTabQuery['contact']['people']['nodes'][0];

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

  const [updatePerson] = useUpdatePersonMutation();
  const [createPerson] = useCreatePersonMutation();
  const [deletePerson, { loading: deleting }] = useDeletePersonMutation();
  // TODO
  const [updateUserProfile] = useUpdateUserMutation();
  const [editMailingInfo] = useEditMailingInfoMutation();

  const { personSchema, initialPerson } = getPersonSchema(t, contactId, person);

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

  const onSubmit = async (
    fields: (PersonCreateInput | PersonUpdateInput) & NewSocial,
  ): Promise<void> => {
    const attributes = formatSubmittedFields(fields);

    const isUpdate = (
      attributes: PersonCreateInput | PersonUpdateInput,
    ): attributes is PersonUpdateInput => !!person;

    if (userProfile) {
      await updateUserProfile({
        variables: {
          attributes,
        },
      });

      enqueueSnackbar(t('Profile updated successfully'), {
        variant: 'success',
      });
    } else if (isUpdate(attributes)) {
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

      await updatePerson({
        variables: {
          accountListId,
          attributes,
        },
      });

      if (file) {
        // Update the contact's avatar since it is based on the primary person's avatar
        client.refetchQueries({ include: ['GetContactDetailsHeader'] });
      }

      // If deceased - Update contact's name, greetings & primary contact
      if (
        fields.deceased &&
        !person?.deceased &&
        contactData &&
        fields.firstName
      ) {
        const { greeting, envelopeGreeting, name } = contactData;
        if (greeting && envelopeGreeting) {
          const removeNameFromGreetings = (
            greeting,
            startsWithRegex: RegExp | null = null,
            startsWithReplace: string | null = null,
          ) => {
            let newGreeting = greeting;
            const nameWithAnd = new RegExp(` and ${fields.firstName}`);
            if (nameWithAnd.test(greeting)) {
              newGreeting = newGreeting.replace(nameWithAnd, '');
            } else {
              newGreeting = newGreeting.replace(fields.firstName, '');
            }
            const endsWith = / and $/;
            const startsWith = startsWithRegex ?? /^ and /;
            const hasDoubleAnd = / and  and /;
            newGreeting = newGreeting.replace(endsWith, '');
            newGreeting = newGreeting.replace(
              startsWith,
              startsWithReplace ?? '',
            );
            newGreeting = newGreeting.replace(hasDoubleAnd, ' and ');
            return newGreeting;
          };
          // Updating contact's name and greetings
          const newGreeting = removeNameFromGreetings(greeting);
          const newEnvelopeGreeting = removeNameFromGreetings(envelopeGreeting);
          const newName = removeNameFromGreetings(name, /,\s{1,}and /, ', ');

          interface attributes {
            id: string;
            greeting: any;
            envelopeGreeting: any;
            name: any;
            primaryPersonId?: string;
          }
          const attributes: attributes = {
            id: contactId,
            greeting: newGreeting,
            envelopeGreeting: newEnvelopeGreeting,
            name: newName,
          };
          // Updating contact's primary contact if deceased is current primary contact.
          const newPrimaryContact =
            contactData.primaryPerson?.id === person?.id
              ? contactData.people.nodes.find(
                  (people) => people.id !== person?.id && !people.deceased,
                )
              : undefined;
          if (
            contactData.primaryPerson?.id === person?.id &&
            newPrimaryContact?.id
          ) {
            attributes.primaryPersonId = newPrimaryContact?.id;
          }

          await editMailingInfo({
            variables: {
              accountListId,
              attributes,
            },
            update: (cache) => {
              const query = {
                query: GetContactDetailsHeaderDocument,
                variables: { accountListId, contactId },
              };
              const dataFromCache =
                cache.readQuery<GetContactDetailsHeaderQuery>(query);
              if (dataFromCache) {
                const data = {
                  ...dataFromCache,
                  contact: {
                    ...dataFromCache.contact,
                    name: newName,
                  },
                };
                cache.writeQuery({ ...query, data });
              }

              if (attributes.primaryPersonId) {
                const ContactDetailsTabQuery = {
                  query: ContactDetailsTabDocument,
                  variables: {
                    accountListId,
                    contactId,
                  },
                };
                const ContactDetailsTabDataCache =
                  cache.readQuery<ContactDetailsTabQuery>(
                    ContactDetailsTabQuery,
                  );

                if (ContactDetailsTabDataCache) {
                  const data = {
                    ...ContactDetailsTabDataCache,
                    contact: {
                      ...ContactDetailsTabDataCache.contact,
                      primaryPerson: newPrimaryContact,
                    },
                  };
                  cache.writeQuery({ ...ContactDetailsTabQuery, data });
                }
                enqueueSnackbar(
                  t('Switched primary contact to {{name}}', {
                    name: newPrimaryContact?.firstName,
                  }),
                  {
                    variant: 'success',
                  },
                );
              }
            },
          });

          enqueueSnackbar(
            t("Updated contact's name and greeting information"),
            {
              variant: 'success',
            },
          );
        }
      }

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
    handleRemoveDialogOpen(false);
    enqueueSnackbar(t('Person deleted successfully'), {
      variant: 'success',
    });
  };

  return (
    <Modal
      isOpen={true}
      title={
        userProfile
          ? 'Edit Details'
          : person
          ? t('Edit Person')
          : t('Create Person')
      }
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
                    showOptOutENewsletter={!userProfile}
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
                    <PersonShowMore formikProps={formikProps} />
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
              {person && !userProfile && (
                <DeleteButton onClick={() => handleRemoveDialogOpen(true)} />
              )}
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
      <DeleteConfirmation
        deleteType="person"
        open={removeDialogOpen}
        deleting={deleting}
        onClickConfirm={deletePersonFromContact}
        onClickDecline={handleRemoveDialogOpen}
      />
    </Modal>
  );
};
