import {
  CircularProgress,
  DialogActions,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Field, FieldArray, FieldProps, Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useCreateContactMutation } from '../CreateContact/CreateContact.generated';
import { ContactReferralTabDocument } from 'src/components/Contacts/ContactDetails/ContactReferralTab/ContactReferralTab.generated';
import { useCreatePersonMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonModal.generated';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import theme from '../../../../../../../../theme';
import { PersonCreateInput } from '../../../../../../../../../graphql/types.generated';
import { useCreateContactAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddAddressModal/CreateContactAddress.generated';
import {
  AddressFields,
  StreetAutocomplete,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/StreetAutocomplete/StreetAutocomplete';
import { useSetContactPrimaryAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/SetPrimaryAddress.generated';

const InputRow = styled(TableRow)(() => ({
  display: 'flex',
  '&:nth-child(odd)': {
    backgroundColor: '#f9f9f9',
  },
  '&:last-child .MuiTableCell-root': {
    borderBottom: 'none',
  },
}));

const InputCell = styled(TableCell)(() => ({
  flex: 1,
  [theme.breakpoints.down('lg')]: {
    minWidth: '150px',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: '130px',
  },
}));

const DialogContentCustom = styled(DialogContent)(() => ({
  maxHeight: 'calc(100vh - 200px)',
  overflowX: 'auto',
}));

interface Props {
  accountListId: string;
  handleClose: () => void;
  referredById?: string;
}

interface ContactRow {
  firstName: string;
  spouseName: string;
  lastName: string;
  address: AddressFields;
  phone: string;
  email: string;
}

interface ContactTable {
  contacts: ContactRow[];
}

const contactsSchema = yup.object().shape({
  contacts: yup.array().of(
    yup.object().shape({
      firstName: yup.string(),
      spouseName: yup.string(),
      lastName: yup.string(),
      address: yup.object({
        city: yup.string(),
        country: yup.string(),
        location: yup.string(),
        metroArea: yup.string(),
        postalCode: yup.string(),
        region: yup.string(),
        state: yup.string(),
        street: yup.string(),
      }),
      phone: yup.string(),
      email: yup.string(),
    }),
  ),
});

const defaultContact: ContactRow = {
  firstName: '',
  spouseName: '',
  lastName: '',
  address: {
    street: '',
  },
  phone: '',
  email: '',
};

export const CreateMultipleContacts = ({
  accountListId,
  handleClose,
  referredById,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const initialContacts: ContactTable = {
    contacts: new Array(10).fill(defaultContact),
  };

  const [createContact] = useCreateContactMutation();
  const [createPerson] = useCreatePersonMutation();
  const [createAddress] = useCreateContactAddressMutation();
  const [setPrimaryAddress] = useSetContactPrimaryAddressMutation();

  const onSubmit = async (attributes: ContactTable) => {
    const filteredContacts = attributes.contacts.filter(
      (contact) => contact.firstName,
    );
    if (filteredContacts.length > 0) {
      const createdContacts = await Promise.all(
        filteredContacts.map(async (contact) => {
          const { firstName, lastName, spouseName, address, phone, email } =
            contact;
          const { data } = await createContact({
            variables: {
              accountListId,
              attributes: {
                name: lastName
                  ? spouseName
                    ? `${lastName}, ${firstName} and ${spouseName}`
                    : `${lastName}, ${firstName}`
                  : spouseName
                  ? `${firstName} and ${spouseName}`
                  : `${firstName}`,
                contactReferralsToMe: referredById
                  ? [{ referredById }]
                  : undefined,
              },
            },
            refetchQueries: [
              {
                query: ContactsDocument,
                variables: { accountListId },
              },
              ...(referredById
                ? [
                    {
                      query: ContactReferralTabDocument,
                      variables: { accountListId, contactId: referredById },
                    },
                  ]
                : []),
            ],
          });
          const contactId = data?.createContact?.contact?.id;
          if (contactId) {
            const people: PersonCreateInput[] = [
              {
                contactId,
                firstName,
                lastName,
                phoneNumbers: phone
                  ? [{ number: phone, primary: true }]
                  : undefined,
                emailAddresses: email
                  ? [{ email: email, primary: true }]
                  : undefined,
              },
            ];

            if (spouseName) {
              people.push({
                contactId,
                firstName: spouseName,
                lastName,
              });
            }
            for (const person of people) {
              await createPerson({
                variables: {
                  accountListId,
                  attributes: person,
                },
              });
            }

            if (address.street) {
              const { data } = await createAddress({
                variables: {
                  accountListId,
                  attributes: {
                    contactId,
                    ...address,
                  },
                },
              });
              const addressId = data?.createAddress?.address.id;
              if (addressId) {
                await setPrimaryAddress({
                  variables: {
                    contactId,
                    primaryAddressId: addressId,
                  },
                });
              }
            }
          }
          return contactId;
        }),
      );

      enqueueSnackbar(
        createdContacts.length > 1
          ? t('{{count}} contacts successfully created', {
              count: createdContacts.length,
            })
          : t('Contact successfully created'),
        {
          variant: 'success',
        },
      );
    }

    handleClose();
  };

  return (
    <Formik
      initialValues={initialContacts}
      validationSchema={contactsSchema}
      validateOnChange={false}
      onSubmit={onSubmit}
    >
      {({
        values: { contacts },
        isValid,
        isSubmitting,
        setFieldValue,
      }): ReactElement => (
        <Form>
          <DialogContentCustom dividers sx={{ padding: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ display: 'flex' }}>
                    <InputCell align="left">{t('First')}</InputCell>
                    <InputCell align="left">{t('Spouse')}</InputCell>
                    <InputCell align="left">{t('Last')}</InputCell>
                    <InputCell align="left">{t('Address')}</InputCell>
                    <InputCell align="left">{t('Phone')}</InputCell>
                    <InputCell align="left">{t('Email')}</InputCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <FieldArray
                    name="contacts"
                    render={() =>
                      contacts.map((contact, index) => (
                        <InputRow key={index}>
                          <InputCell>
                            <Field name="firstName">
                              {({ field }: FieldProps) => (
                                <TextField
                                  {...field}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  type="text"
                                  inputProps={{
                                    'aria-label': t('First'),
                                  }}
                                  value={contact.firstName}
                                  onChange={(e) =>
                                    setFieldValue(
                                      `contacts.${index}.firstName`,
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </Field>
                          </InputCell>
                          <InputCell>
                            <Field name="spouseName">
                              {({ field }: FieldProps) => (
                                <TextField
                                  {...field}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  type="text"
                                  inputProps={{
                                    'aria-label': t('Spouse'),
                                  }}
                                  value={contact.spouseName}
                                  onChange={(e) =>
                                    setFieldValue(
                                      `contacts.${index}.spouseName`,
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </Field>
                          </InputCell>
                          <InputCell>
                            <Field name="lastName">
                              {({ field }: FieldProps) => (
                                <TextField
                                  {...field}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  type="text"
                                  inputProps={{
                                    'aria-label': t('Last'),
                                  }}
                                  value={contact.lastName}
                                  onChange={(e) =>
                                    setFieldValue(
                                      `contacts.${index}.lastName`,
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </Field>
                          </InputCell>
                          <InputCell>
                            <Field name="address">
                              {({ field }: FieldProps) => (
                                <StreetAutocomplete
                                  TextFieldProps={{
                                    variant: 'outlined',
                                    size: 'small',
                                    fullWidth: true,
                                    'aria-label': t('Address'),
                                    ...field,
                                  }}
                                  streetValue={contact.address.street}
                                  onStreetChange={(street) =>
                                    setFieldValue(
                                      `contacts.${index}.address.street`,
                                      street,
                                    )
                                  }
                                  onPredictionChosen={(fields) => {
                                    Object.entries(fields).forEach(
                                      ([field, value]) => {
                                        setFieldValue(
                                          `contacts.${index}.address.${field}`,
                                          value,
                                        );
                                      },
                                    );
                                  }}
                                />
                              )}
                            </Field>
                          </InputCell>
                          <InputCell>
                            <Field name="phone">
                              {({ field }: FieldProps) => (
                                <TextField
                                  {...field}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  type="text"
                                  inputProps={{
                                    'aria-label': t('Phone'),
                                  }}
                                  value={contact.phone}
                                  onChange={(e) =>
                                    setFieldValue(
                                      `contacts.${index}.phone`,
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </Field>
                          </InputCell>
                          <InputCell>
                            <Field name="email">
                              {({ field }: FieldProps) => (
                                <TextField
                                  {...field}
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  type="text"
                                  inputProps={{
                                    'aria-label': t('Email'),
                                  }}
                                  value={contact.email}
                                  onChange={(e) =>
                                    setFieldValue(
                                      `contacts.${index}.email`,
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </Field>
                          </InputCell>
                        </InputRow>
                      ))
                    }
                  />
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContentCustom>
          <DialogActions>
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              disabled={
                !isValid ||
                isSubmitting ||
                contacts.filter((c) => c.firstName).length <= 0
              }
            >
              {isSubmitting ? (
                <CircularProgress color="secondary" size={20} />
              ) : (
                t('Save')
              )}
            </SubmitButton>
          </DialogActions>
        </Form>
      )}
    </Formik>
  );
};
