import { Grid, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ErrorMessage, Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { AddIcon } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/StyledComponents';
import { RowWrapper } from './FixEmailAddressPerson';

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
  emails?: EmailValidationFormEmail;
  index: number;
  personId?: string;
  handleAdd?: (personId: string, email: string) => void;
}

//TODO: Implement during MPDX-7946
const onSubmit = () => {};

const EmailValidationForm = ({
  emails: initialEmail = {
    email: '',
    isPrimary: false,
    updatedAt: '',
    source: '',
    personId: '',
    isValid: false,
  },
}: EmailValidationFormProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const validationSchema = Yup.object().shape({
    email: Yup.string().email(' ').required(' '),
  });
  const { t } = useTranslation();

  const handleValidation = (isValid) => {
    if (!isValid) {
      enqueueSnackbar(t('Invalid Email Address Format'), {
        variant: 'error',
      });
    }
  };

  //TODO: Add button functionality to add email using graphql mutation

  // const handleButtonClick = (email) => {

  // };

  return (
    <Formik
      initialValues={{
        email: initialEmail.email,
        isPrimary: initialEmail.isPrimary,
        updatedAt: '',
        source: '',
        personId: 'test',
        isValid: false,
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, isValid }) => (
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
                onBlur={() => handleValidation(isValid)}
              />
              <IconButton
                type="submit"
                color="primary"
                disabled={!isValid || values.email === ''}
                data-testid={`addButton-${initialEmail.personId}`}
                // onClick={() => handleButtonClick(values.email)}
              >
                <AddIcon fontSize="large" />
              </IconButton>
            </Grid>
          </RowWrapper>
          <ErrorMessage name="email" component="div" />
        </Form>
      )}
    </Formik>
  );
};

export default EmailValidationForm;
