import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  TextField,
  Theme,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { AddIcon } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/StyledComponents';
import i18n from 'src/lib/i18n';
import { useEmailAddressesMutation } from './AddEmailAddress.generated';
import {
  GetInvalidEmailAddressesDocument,
  GetInvalidEmailAddressesQuery,
} from './FixEmailAddresses.generated';

const useStyles = makeStyles()((theme: Theme) => ({
  responsiveBorder: {
    [theme.breakpoints.down('xs')]: {
      paddingBottom: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.mpdxGrayMedium.main}`,
    },
  },
  paddingX: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  paddingB2: {
    paddingBottom: theme.spacing(1),
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

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
  personId: string;
  accountListId: string;
}

const validationSchema = yup.object({
  email: yup
    .string()
    .email(i18n.t('Invalid Email Address Format'))
    .required(i18n.t('Please enter a valid email address')),
  isPrimary: yup.bool().default(false),
  updatedAt: yup.string(),
  source: yup.string(),
  personId: yup.string(),
  isValid: yup.bool().default(false),
});

const EmailValidationForm = ({
  personId,
  accountListId,
}: EmailValidationFormProps) => {
  const { t } = useTranslation();
  const [emailAddressesMutation] = useEmailAddressesMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { classes } = useStyles();

  const initialEmail = {
    email: '',
    isPrimary: false,
    updatedAt: '',
    source: '',
    personId,
    isValid: false,
  } as EmailValidationFormEmail;

  const onSubmit = (values, actions) => {
    emailAddressesMutation({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes: {
            id: personId,
            emailAddresses: [
              {
                email: values.email,
              },
            ],
          },
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
      onCompleted: () => {
        enqueueSnackbar(t('Added email address'), { variant: 'success' });
      },
      onError: () => {
        enqueueSnackbar(t('Failed to add email address'), { variant: 'error' });
      },
    });
  };

  return (
    <Formik
      initialValues={initialEmail}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({
        values,
        handleChange,
        handleBlur,
        touched,
        errors,
        handleSubmit,
        isValid,
      }) => (
        <>
          <Grid item xs={12} sm={6} className={classes.paddingB2}>
            <Box
              display="flex"
              justifyContent="flex-start"
              className={clsx(classes.responsiveBorder, classes.paddingX)}
            >
              <FormControl fullWidth>
                <ContactInputField
                  destroyed={false}
                  label={t('New Email Address')}
                  type="email"
                  name="email"
                  value={values.email}
                  style={{ width: '100%' }}
                  size="small"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormControl>

              <IconButton
                onClick={() => handleSubmit()}
                className={classes.iconButton}
                disabled={!isValid || values.email === ''}
                data-testid={`addButton-${initialEmail.personId}`}
              >
                <Tooltip title="Add Address">
                  <AddIcon fontSize="small" />
                </Tooltip>
              </IconButton>
            </Box>
          </Grid>

          {touched.email && Boolean(errors.email) && (
            <>
              <Grid item xs={12} sm={6}></Grid>
              <Grid item xs={12} sm={6}>
                <FormHelperText error={true} className={classes.paddingX}>
                  {errors.email}
                </FormHelperText>
              </Grid>
            </>
          )}
        </>
      )}
    </Formik>
  );
};

export default EmailValidationForm;
