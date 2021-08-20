import React, { ReactElement } from 'react';
import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  styled,
  TextField,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import { ContactCreateInput } from '../../../../../../../../../graphql/types.generated';
import { useCreateContactMutation } from './CreateContact.generated';

interface Props {
  accountListId: string;
  handleClose: () => void;
}

const CreateContactTitle = styled(DialogTitle)(() => ({
  textTransform: 'uppercase',
  textAlign: 'center',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: '#EBECEC',
  },
}));

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

const contactSchema: yup.SchemaOf<
  Pick<ContactCreateInput, 'name'>
> = yup.object({
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

  const onSubmit = async (attributes: ContactCreateInput) => {
    const { data } = await createContact({
      variables: {
        accountListId,
        attributes,
      },
    });

    const contactId = data?.createContact?.contact.id;
    if (contactId) {
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
          <CreateContactTitle>
            {t('New Contact')}
            <CloseButton onClick={handleClose}>
              <CloseIcon titleAccess={t('Close')} />
            </CloseButton>
          </CreateContactTitle>
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
            <Button disabled={isSubmitting} onClick={handleClose}>
              {t('Cancel')}
            </Button>
            <Button
              size="large"
              variant="contained"
              color="primary"
              disabled={!isValid || isSubmitting}
              type="submit"
            >
              {creating && <LoadingIndicator size={20} />}
              {t('Save')}
            </Button>
          </DialogActions>
        </form>
      )}
    </Formik>
  );
};

export default CreateContact;
