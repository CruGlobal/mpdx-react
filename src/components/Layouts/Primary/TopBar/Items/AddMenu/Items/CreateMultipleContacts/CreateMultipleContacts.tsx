import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  MenuItem,
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
import { ContactStatusSelect } from 'src/common/Selects/ContactStatusSelect/ContactStatusSelect';
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
} from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import { PersonCreateInput, StatusEnum } from 'src/graphql/types.generated';
import { useUpdateCache } from 'src/hooks/useUpdateCache';
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
  // On phones each row becomes a stacked card of labeled fields
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    padding: theme.spacing(2, 0),
    borderBottom: `2px solid ${theme.palette.grey[400]}`,
    '&:last-child': {
      borderBottom: 'none',
    },
    '& .MuiTableCell-root': {
      borderBottom: 'none',
    },
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
  [theme.breakpoints.down('sm')]: {
    flex: 'none',
    width: 'auto',
    minWidth: 0,
    padding: theme.spacing(0.5, 2),
    '&[data-label]::before': {
      content: 'attr(data-label)',
      display: 'block',
      fontWeight: 'bold',
      marginBottom: theme.spacing(0.5),
    },
  },
}));

const HeaderRow = styled(TableRow)(() => ({
  display: 'flex',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
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
  const { push } = useRouter();
  const initialContacts: ContactTable = {
    contacts: new Array(rows).fill(defaultContact),
  };
  const [createContact] = useCreateContactMutation();
  const [createPerson] = useCreatePersonMutation();
  const [createAddress] = useCreateContactAddressMutation();
  const { update: updatePrimaryAddressCache } = useUpdateCache();
  const [setPrimaryAddress] = useSetContactPrimaryAddressMutation({
    update: updatePrimaryAddressCache,
  });

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

      const ids = createdContacts.filter((id) => typeof id === 'string');
      if (ids.length > 0) {
        push({
          pathname: '/accountLists/[accountListId]/contacts',
          query: {
            accountListId,
            filters: JSON.stringify({ ids }),
          },
        });
      }
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
                  <HeaderRow>
                    <InputCell align="left">{t('First')}</InputCell>
                    <InputCell align="left">{t('Spouse')}</InputCell>
                    <InputCell align="left">{t('Last')}</InputCell>
                    <InputCell align="left">{t('Street Address')}</InputCell>
                    <InputCell align="left">{t('Phone')}</InputCell>
                    <InputCell align="left">{t('Email')}</InputCell>
                    <InputCell align="left">{t('Status')}</InputCell>
                  </HeaderRow>
                </TableHead>
                <TableBody>
                  <FieldArray
                    name="contacts"
                    render={() =>
                      contacts.map((contact, index) => (
                        <InputRow key={index}>
                          <InputCell data-label={t('First')}>
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
                          <InputCell data-label={t('Spouse')}>
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
                          <InputCell data-label={t('Last')}>
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
                          <InputCell data-label={t('Street Address')}>
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
                          <InputCell data-label={t('Phone')}>
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
                          <InputCell data-label={t('Email')}>
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
                          <InputCell data-label={t('Status')}>
                            <FormControl size="small" fullWidth>
                              <ContactStatusSelect
                                role="listbox"
                                aria-label={t('Status')}
                                value={contact.status ?? ''}
                                onChange={(e) =>
                                  setFieldValue(
                                    `contacts.${index}.status`,
                                    e.target.value,
                                  )
                                }
                              >
                                <MenuItem value={''}>
                                  <em>{t('None')}</em>
                                </MenuItem>
                              </ContactStatusSelect>
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
