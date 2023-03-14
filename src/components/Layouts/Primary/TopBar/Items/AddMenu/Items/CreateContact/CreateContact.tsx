import React, { ReactElement } from 'react';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormLabel,
  Grid,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import {
  ContactCreateInput,
  PersonCreateInput,
} from '../../../../../../../../../graphql/types.generated';
import {
  useCreateContactMutation,
  useCreatePersonMutation,
} from './CreateContact.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

interface Props {
  accountListId: string;
  handleClose: () => void;
}

interface people {
  firstName: string;
  lastName: string;
}

const LogFormControl = styled(FormControl)(() => ({
  width: '100%',
}));

const LogFormLabel = styled(FormLabel)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  fontWeight: 'bold',
  color: theme.palette.primary.dark,
  '& span': {
    color: theme.palette.error.main,
  },
}));

const LogTextField = styled(TextField)(({ theme }) => ({
  '& div': {
    padding: theme.spacing(1),
  },
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const contactSchema: yup.SchemaOf<Pick<ContactCreateInput, 'name'>> =
  yup.object({
    name: yup.string().required(),
  });

const CreateContact = ({
  accountListId,
  handleClose,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { push } = useRouter();

  const initialContact: ContactCreateInput = {
    name: '',
  };

  const [createContact, { loading: creating }] = useCreateContactMutation();
  const [createPerson, { loading: creatingPerson }] = useCreatePersonMutation();

  const onSubmit = async (attributes: ContactCreateInput) => {
    const { data } = await createContact({
      variables: {
        accountListId,
        attributes,
      },
    });
    const contactId = data?.createContact?.contact.id;

    if (contactId) {
      const { name } = attributes;
      const people: people[] = [];
      let firstAndSpouseNames = name;
      let lastName = '';
      if (name.includes(',')) {
        const findLastName = name.split(/, |,/g);
        lastName = findLastName[0];
        firstAndSpouseNames = findLastName[1];
      }
      if (firstAndSpouseNames.toLocaleLowerCase().includes(' and ')) {
        const findFirstName = firstAndSpouseNames.split(/ and (.*)/s);
        people.push({
          firstName: findFirstName[0],
          lastName,
        });
        people.push({
          firstName: findFirstName[1],
          lastName,
        });
      } else {
        const findFirstName = firstAndSpouseNames.split(/ (.*)/s, 2);
        people.push({
          firstName: findFirstName[0],
          lastName: lastName ? lastName : findFirstName[1] ?? '',
        });
      }
      await Promise.all(
        people.map(async (person) => {
          const personAttributes: PersonCreateInput = {
            contactId: contactId,
            firstName: person.firstName,
            lastName: person.lastName,
          };
          await createPerson({
            variables: {
              accountListId,
              attributes: personAttributes,
            },
          });
        }),
      );
      push({
        pathname: '/accountLists/[accountListId]/contacts/[contactId]',
        query: { accountListId, contactId },
      });
    }
    enqueueSnackbar(t('Contact successfully created'), {
      variant: 'success',
    });
    handleClose();
  };
  // TODO: Have component search through possible existing contacts while user types contact name
  return (
    <Formik
      initialValues={initialContact}
      validationSchema={contactSchema}
      onSubmit={onSubmit}
    >
      {({
        values: { name },
        handleChange,
        handleSubmit,
        isSubmitting,
        isValid,
        errors,
        touched,
      }): ReactElement => (
        <form onSubmit={handleSubmit} noValidate>
          <DialogContent dividers>
            <Grid container>
              <Grid item xs={12}>
                <LogFormControl>
                  <LogFormLabel required>{t('Name')}</LogFormLabel>
                  <LogTextField
                    value={name}
                    onChange={handleChange('name')}
                    fullWidth
                    multiline
                    placeholder={t('Last Name, First Name and Spouse Name')}
                    inputProps={{ 'aria-label': t('Name') }}
                    error={!!errors.name && touched.name}
                    helperText={
                      errors.name && touched.name && t('Field is required')
                    }
                    variant="outlined"
                    required
                  />
                </LogFormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <CancelButton disabled={isSubmitting} onClick={handleClose} />
            <SubmitButton disabled={!isValid || isSubmitting}>
              {(creating || creatingPerson) && <LoadingIndicator size={20} />}
              {t('Save')}
            </SubmitButton>
          </DialogActions>
        </form>
      )}
    </Formik>
  );
};

export default CreateContact;
