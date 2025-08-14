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
import clsx from 'clsx';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { AddIcon } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/StyledComponents';
import {
  GetInvalidPhoneNumbersDocument,
  GetInvalidPhoneNumbersQuery,
} from './GetInvalidPhoneNumbers.generated';
import { useUpdatePhoneNumberMutation } from './UpdateInvalidPhoneNumbers.generated';

const useStyles = makeStyles()((theme: Theme) => ({
  responsiveBorder: {
    [theme.breakpoints.down('xs')]: {
      paddingBottom: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  paddingX: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  paddingB2: {
    paddingBottom: theme.spacing(1),
  },
  ContactIconContainer: {
    margin: theme.spacing(0, 1),
    width: theme.spacing(4),
    height: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface PhoneValidationFormPhone {
  number: string;
  isPrimary: boolean;
  updatedAt: string;
  source: string;
  personId: string;
  isValid: boolean;
}

interface PhoneNumberValidationFormProps {
  personId: string;
  accountListId: string;
}

const PhoneValidationForm = ({
  personId,
  accountListId,
}: PhoneNumberValidationFormProps) => {
  const { t } = useTranslation();
  const [UpdatePhoneNumber] = useUpdatePhoneNumberMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { classes } = useStyles();

  const validationSchema = yup.object({
    number: yup
      .string()
      .test(
        'is-phone-number',
        t('This field is not a valid phone number'),
        (val) => typeof val === 'string' && /\d/.test(val),
      )
      .required(t('Phone Number is required')),
    isPrimary: yup.bool().default(false),
    updatedAt: yup.string(),
    source: yup.string(),
    personId: yup.string(),
    isValid: yup.bool().default(false),
  });

  const initialPhone = {
    number: '',
    isPrimary: false,
    updatedAt: '',
    source: '',
    personId,
    isValid: false,
  } as PhoneValidationFormPhone;

  const onSubmit = (values, actions) => {
    UpdatePhoneNumber({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes: {
            id: personId,
            phoneNumbers: [
              {
                number: values.number,
              },
            ],
          },
        },
      },
      update: (cache, { data: addPhoneNumberData }) => {
        actions.resetForm();
        const query = {
          query: GetInvalidPhoneNumbersDocument,
          variables: {
            accountListId: accountListId,
          },
        };
        const dataFromCache =
          cache.readQuery<GetInvalidPhoneNumbersQuery>(query);
        if (dataFromCache) {
          const peopleWithNewPhone = dataFromCache.people.nodes.map(
            (person) => {
              if (
                person.id === personId &&
                addPhoneNumberData?.updatePerson?.person?.phoneNumbers?.nodes
              ) {
                return {
                  ...person,
                  phoneNumbers: {
                    nodes:
                      addPhoneNumberData?.updatePerson?.person?.phoneNumbers
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
                nodes: peopleWithNewPhone,
              },
            },
          });
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Added phone number'), { variant: 'success' });
      },
      onError: () => {
        enqueueSnackbar(t('Failed to add phone number'), { variant: 'error' });
      },
    });
  };

  return (
    <Formik
      initialValues={initialPhone}
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
                <TextField
                  data-testid={`addNewNumberInput-${initialPhone.personId}`}
                  label={t('New Phone Number')}
                  name="number"
                  value={values.number}
                  style={{ width: '100%' }}
                  size="small"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormControl>
              <Box display="flex" justifyContent="center" alignItems="center">
                <IconButton
                  onClick={() => handleSubmit()}
                  className={classes.ContactIconContainer}
                  disabled={!isValid || values.number === ''}
                  data-testid={`addButton-${initialPhone.personId}`}
                >
                  <Tooltip title="Add Phone Number">
                    <AddIcon fontSize="small" />
                  </Tooltip>
                </IconButton>
              </Box>
            </Box>
          </Grid>
          {touched.number && Boolean(errors.number) && (
            <>
              <Grid item xs={12} sm={6}></Grid>
              <Grid item xs={12} sm={6}>
                <FormHelperText error={true} className={classes.paddingX}>
                  {errors.number}
                </FormHelperText>
              </Grid>
            </>
          )}
        </>
      )}
    </Formik>
  );
};

export default PhoneValidationForm;
