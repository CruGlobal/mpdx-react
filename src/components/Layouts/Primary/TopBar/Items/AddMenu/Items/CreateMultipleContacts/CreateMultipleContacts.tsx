import React, { ReactElement } from 'react';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  ListSubheader,
  MenuItem,
  Select,
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
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { useCreateContactAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/AddAddressModal/CreateContactAddress.generated';
import { useSetContactPrimaryAddressMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/SetPrimaryAddress.generated';
import {
  AddressFields,
  StreetAutocomplete,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/StreetAutocomplete/StreetAutocomplete';
import { useCreatePersonMutation } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonModal.generated';
import { ContactReferralTabDocument } from 'src/components/Contacts/ContactDetails/ContactReferralTab/ContactReferralTab.generated';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { PersonCreateInput, StatusEnum } from 'src/graphql/types.generated';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import theme from '../../../../../../../../theme';
import { useCreateContactMutation } from '../CreateContact/CreateContact.generated';

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
  width: '1%',
  [theme.breakpoints.down('lg')]: {
    minWidth: '130px',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: '100px',
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
  rows?: number;
}

interface ContactRow {
  firstName: string;
  spouseName: string;
  lastName: string;
  address: AddressFields;
  phone: string;
  email: string;
  status: StatusEnum | null;
}

interface ContactTable {
  contacts: ContactRow[];
}

const contactsSchema = yup.object({
  contacts: yup.array().of(
    yup
      .object({
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
        status: yup
          .mixed<StatusEnum>()
          .oneOf(Object.values(StatusEnum))
          .nullable(),
      })
      .required(),
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
  status: null,
};

export const CreateMultipleContacts = ({
  accountListId,
  handleClose,
  referredById,
  rows = 10,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const initialContacts: ContactTable = {
    contacts: new Array(rows).fill(defaultContact),
  };
  const constants = useApiConstants();
  const phases = constants?.phases;
  const { getLocalizedContactStatus } = useLocalizedConstants();
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
          const {
            firstName,
            lastName,
            spouseName,
            address,
            phone,
            email,
            status,
          } = contact;
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
                status: status || StatusEnum.NeverContacted,
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
                    <InputCell align="left">{t('Street Address')}</InputCell>
                    <InputCell align="left">{t('Phone')}</InputCell>
                    <InputCell align="left">{t('Email')}</InputCell>
                    <InputCell align="left">{t('Status')}</InputCell>
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
                                    'aria-label': t('Street Address'),
                                    ...field,
                                  }}
                                  streetValue={contact.address.street}
                                  onStreetChange={(street) =>
                                    setFieldValue(`contacts.${index}.address`, {
                                      street,
                                    })
                                  }
                                  onPredictionChosen={(fields) => {
                                    setFieldValue(
                                      `contacts.${index}.address`,
                                      fields,
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
                          <InputCell>
                            <FormControl size="small" fullWidth>
                              <Select
                                aria-label={t('Status')}
                                role="listbox"
                                value={contact.status}
                                onChange={(e) =>
                                  setFieldValue(
                                    `contacts.${index}.status`,
                                    e.target.value,
                                  )
                                }
                              >
                                <MenuItem>
                                  <em>{t('None')}</em>
                                </MenuItem>
                                {phases?.map((phase) => [
                                  <ListSubheader key={phase?.id}>
                                    {phase?.name}
                                  </ListSubheader>,
                                  phase?.contactStatuses.map((status) => (
                                    <MenuItem key={status} value={status}>
                                      {getLocalizedContactStatus(status)}
                                    </MenuItem>
                                  )),
                                ])}
                              </Select>
                            </FormControl>
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
