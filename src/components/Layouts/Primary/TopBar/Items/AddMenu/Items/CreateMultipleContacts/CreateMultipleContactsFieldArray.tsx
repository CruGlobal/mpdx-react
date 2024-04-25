import React, { memo } from 'react';
import { TableCell, TableRow, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Field, FieldArray, FieldProps } from 'formik';
import { TFunction } from 'i18next';
import { StreetAutocomplete } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/StreetAutocomplete/StreetAutocomplete';
import theme from '../../../../../../../../theme';
import { ContactRow } from './CreateMultipleContacts';

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

type CreateMultipleContactsFieldArrayProps = {
  t: TFunction;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined,
  ) => void;
  contacts: ContactRow[];
};

const CreateMultipleContactsFieldArray = memo(
  function CreateMultipleContactsFieldArray({
    t,
    setFieldValue,
    contacts,
  }: CreateMultipleContactsFieldArrayProps) {
    return (
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
                        setFieldValue(`contacts.${index}.address`, fields);
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
                        setFieldValue(`contacts.${index}.phone`, e.target.value)
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
                        setFieldValue(`contacts.${index}.email`, e.target.value)
                      }
                    />
                  )}
                </Field>
              </InputCell>
            </InputRow>
          ))
        }
      />
    );
  },
);

export default CreateMultipleContactsFieldArray;
