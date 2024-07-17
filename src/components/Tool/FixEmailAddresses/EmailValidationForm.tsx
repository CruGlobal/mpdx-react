import { Grid, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Form, Formik } from 'formik';
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
  index: number;
  personId: string;
  handleAdd?: (personId: string, email: string) => void;
}

//TODO: Implement during MPDX-7946
const onSubmit = (values, actions) => {
  actions.resetForm();
};

const EmailValidationForm = ({ personId }: EmailValidationFormProps) => {
  const { t } = useTranslation();

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

  //TODO: Add button functionality to add email using graphql mutation

  // const handleButtonClick = (email) => {

  // };

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
                // onClick={() => handleButtonClick(values.email)}
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
