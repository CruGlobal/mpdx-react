import {
  Box,
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
import {
  ContactReferralTabDocument,
  useUpdateContactReferralMutation,
} from 'src/components/Contacts/ContactDetails/ContactReferralTab/ContactReferralTab.generated';
import { ContactsDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import theme from '../../../../../../../../theme'

const InputRow = styled(TableRow)(() => ({
  '&:nth-child(odd)': {
    backgroundColor: '#f9f9f9',
  },
  '&:last-child .MuiTableCell-root': {
    borderBottom: 'none',
  },
}));

const InputCell = styled(TableCell)(() => ({
  [theme.breakpoints.down('lg')]: {
    minWidth: '150px',
  },
  [theme.breakpoints.down('xs')]: {
    minWidth: '100px',
  },
}))

interface Props {
  accountListId: string;
  handleClose: () => void;
  referrals?: boolean;
  contactId?: string;
}

interface ContactInputInterface {
  firstName?: string;
  spouseName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface InitialContactInterface {
  contacts: ContactInputInterface[];
}

const contactsSchema = yup.object().shape({
  contacts: yup.array().of(
    yup.object().shape({
      firstName: yup.string(),
      spouseName: yup.string(),
      lastName: yup.string(),
      address: yup.string(),
      phone: yup.string(),
      email: yup.string(),
    }),
  ),
});

export const CreateMultipleContacts = ({
  accountListId,
  handleClose,
  referrals,
  contactId,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const initialContacts: InitialContactInterface = {
    contacts: new Array(10).fill({
      firstName: undefined,
      spouseName: undefined,
      lastName: undefined,
      address: undefined,
      phone: undefined,
      email: undefined,
    }),
  };

  const [createContact, { loading: creating }] = useCreateContactMutation();
  const [updateContact, { loading: updating }] =
    useUpdateContactReferralMutation();

  const onSubmit = async (attributes: InitialContactInterface) => {
    const filteredContacts = attributes.contacts.filter(
      (contact) => contact.firstName,
    );
    if (filteredContacts.length > 0) {
      const createdContacts = await Promise.all(
        filteredContacts.map(async (contact) => {
          const { data } = await createContact({
            variables: {
              accountListId,
              attributes: {
                name: contact.lastName
                  ? contact.spouseName
                    ? `${contact.lastName}, ${contact.firstName} and ${contact.spouseName}`
                    : `${contact.lastName}, ${contact.firstName}`
                  : contact.spouseName
                    ? `${contact.firstName} and ${contact.spouseName}`
                    : `${contact.firstName}`,
              },
            },
            refetchQueries: [
              {
                query: ContactsDocument,
                variables: { accountListId },
              },
            ],
          });
          return data?.createContact?.contact.id;
        }),
      );

      if (createdContacts.length > 0) {
        if (referrals && contactId) {
          await Promise.all(
            createdContacts.map(async (contact) => {
              await updateContact({
                variables: {
                  accountListId,
                  attributes: {
                    id: contactId,
                    contactReferralsByMe: [{ referredToId: contact }],
                  },
                },
                refetchQueries: [
                  {
                    query: ContactReferralTabDocument,
                    variables: { accountListId, contactId },
                  },
                ],
              });
            }),
          );
        }
        enqueueSnackbar(
          createdContacts.length > 1
            ? t(`${createdContacts.length} Contacts successfully created`)
            : t('Contact successfully created'),
          {
            variant: 'success',
          },
        );
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
          <DialogContent dividers sx={{ padding: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
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
                    render={() => (
                      <>
                        {contacts.map((contact, index) => (
                          <InputRow key={index}>
                            <InputCell>
                              <Field name="firstName">
                                {({ field }: FieldProps) => (
                                  <Box width="100%">
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
                                  </Box>
                                )}
                              </Field>
                            </InputCell>
                            <InputCell>
                              <Field name="spouseName">
                                {({ field }: FieldProps) => (
                                  <Box width="100%">
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
                                  </Box>
                                )}
                              </Field>
                            </InputCell>
                            <InputCell>
                              <Field name="lastName">
                                {({ field }: FieldProps) => (
                                  <Box width="100%">
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
                                  </Box>
                                )}
                              </Field>
                            </InputCell>
                            <InputCell>
                              {/* TODO: Connect to Google Autocomplete? */}
                              <Field name="address">
                                {({ field }: FieldProps) => (
                                  <Box width="100%">
                                    <TextField
                                      {...field}
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      type="text"
                                      inputProps={{
                                        'aria-label': t('Address'),
                                      }}
                                      value={contact.address}
                                      onChange={(e) =>
                                        setFieldValue(
                                          `contacts.${index}.address`,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </Box>
                                )}
                              </Field>
                            </InputCell>
                            <InputCell>
                              <Field name="phone">
                                {({ field }: FieldProps) => (
                                  <Box width="100%">
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
                                  </Box>
                                )}
                              </Field>
                            </InputCell>
                            <InputCell>
                              <Field name="email">
                                {({ field }: FieldProps) => (
                                  <Box width="100%">
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
                                  </Box>
                                )}
                              </Field>
                            </InputCell>
                          </InputRow>
                        ))}
                      </>
                    )}
                  />
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              disabled={
                !isValid ||
                isSubmitting ||
                contacts.filter((c) => c.firstName).length <= 0
              }
            >
              {creating || updating ? (
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
