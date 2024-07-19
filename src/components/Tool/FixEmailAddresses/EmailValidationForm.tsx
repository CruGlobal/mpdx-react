import { Grid, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { AddIcon } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/StyledComponents';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useEmailAddressesMutation } from './AddEmailAddress.generated';
import { RowWrapper } from './FixEmailAddressPerson/FixEmailAddressPerson';
import {
  GetInvalidEmailAddressesDocument,
  GetInvalidEmailAddressesQuery,
} from './FixEmailAddresses.generated';

const ContactInputField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'destroyed',
})(({ destroyed }: { destroyed: boolean }) => ({
  textDecoration: destroyed ? 'line-through' : 'none',
}));

interface EmailValidationFormEmail {
  email: string;
  isPrimary: boolean;
  updatedAt: string;
  source: string;
  personId: string;
  isValid: boolean;
}

interface EmailValidationFormProps {
  index: number;
  personId: string;
}

const EmailValidationForm = ({ personId }: EmailValidationFormProps) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const [emailAddressesMutation] = useEmailAddressesMutation();

  const initialEmail = {
    email: '',
    isPrimary: false,
    updatedAt: '',
    source: '',
    personId,
    isValid: false,
  } as EmailValidationFormEmail;

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('Invalid Email Address Format'))
      .required('Please enter a valid email address'),
    isPrimary: Yup.bool().default(false),
    updatedAt: Yup.string(),
    source: Yup.string(),
    personId: Yup.string(),
    isValid: Yup.bool().default(false),
  });

  const onSubmit = (values, actions) => {
    emailAddressesMutation({
      variables: {
        input: {
          attributes: {
            id: personId,
            emailAddresses: [
              {
                email: values.email,
              },
            ],
          },
          accountListId: accountListId || '',
        },
      },
      update: (cache, { data: addEmailAddressData }) => {
        actions.resetForm();
        const query = {
          query: GetInvalidEmailAddressesDocument,
          variables: {
            accountListId: accountListId,
          },
        };
        const dataFromCache =
          cache.readQuery<GetInvalidEmailAddressesQuery>(query);
        if (dataFromCache) {
          const peopleWithNewEmail = dataFromCache.people.nodes.map(
            (person) => {
              if (
                person.id === personId &&
                addEmailAddressData?.updatePerson?.person.emailAddresses.nodes
              ) {
                return {
                  ...person,
                  emailAddresses: {
                    nodes:
                      addEmailAddressData?.updatePerson?.person.emailAddresses
                        .nodes,
                  },
                };
              } else {
                return person;
              }
            },
          );

          cache.writeQuery({
            ...query,
            data: {
              people: {
                ...dataFromCache.people,
                nodes: peopleWithNewEmail,
              },
            },
          });
        }
      },
    });
  };

  return (
    <Formik
      initialValues={initialEmail}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleBlur, isValid, touched, errors }) => (
        <Form>
          <RowWrapper>
            <Grid container>
              <ContactInputField
                destroyed={false}
                label={t('New Email Address')}
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={
                  touched.email && Boolean(errors.email) ? errors.email : ''
                }
              />
              <IconButton
                type="submit"
                color="primary"
                disabled={!isValid || values.email === ''}
                data-testid={`addButton-${initialEmail.personId}`}
              >
                <AddIcon fontSize="large" />
              </IconButton>
            </Grid>
          </RowWrapper>
        </Form>
      )}
    </Formik>
  );
};

export default EmailValidationForm;
