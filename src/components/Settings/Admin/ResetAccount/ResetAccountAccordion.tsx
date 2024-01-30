import { ReactElement } from 'react';
import {
  Box,
  DialogActions,
  FormHelperText,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/FieldHelper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { AccordionProps } from '../../accordionHelper';
import { useResetAccountListMutation } from './ResetAccount.generated';

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

export const ResetAccountAccordion: React.FC<AccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const AccordionName = t('Reset Account');
  const { enqueueSnackbar } = useSnackbar();
  const [resetAccountList] = useResetAccountListMutation();

  type ImpersonateUserFormType = {
    user: string;
    account: string;
    reason?: string;
  };

  const ImpersonateUserSchema: yup.SchemaOf<ImpersonateUserFormType> =
    yup.object({
      user: yup.string().email().required(),
      account: yup.string().required(),
      reason: yup.string(),
    });

  const onSubmit = async (attributes: ImpersonateUserFormType, resetForm) => {
    const { user, account, reason } = attributes;

    // Need to build
    await resetAccountList({
      variables: {
        input: {
          resettedUserEmail: user,
          accountListName: account,
          reason: reason ?? '',
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully reset account'), {
          variant: 'success',
        });
        resetForm();
      },
      onError: () => {
        enqueueSnackbar(t('Unable to reset account'), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={AccordionName}
      value={''}
    >
      <StyledFormLabel>{AccordionName}</StyledFormLabel>
      <Typography>
        {t(`This will reset a particular Account by deleting all of its data and reimporting from its Organization(s). Specify
          the Account by typing the User's email address, the reason for the reset, and the exact name of the Account. All
          Users that have access to the Account will be affected.`)}
      </Typography>

      <Formik
        initialValues={{
          user: '',
          reason: '',
          account: '',
        }}
        validationSchema={ImpersonateUserSchema}
        onSubmit={async (values, { resetForm }) => {
          await onSubmit(values, resetForm);
        }}
        isInitialValid={false}
      >
        {({
          values: { user, reason, account },
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          errors,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            <StyledBox marginTop={4}>
              <FieldWrapper>
                <TextField
                  required
                  id="user"
                  label={t('The Key / Relay Email')}
                  type="email"
                  value={user}
                  disabled={isSubmitting}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
                  onChange={handleChange('user')}
                  inputProps={{
                    'data-testid': 'resetUserName',
                  }}
                />
                {errors.user && (
                  <FormHelperText error={true}>{errors.user}</FormHelperText>
                )}
              </FieldWrapper>
            </StyledBox>
            <StyledBox marginTop={2}>
              <FieldWrapper>
                <TextField
                  required
                  id="reason"
                  label={t('Reason / Helpscout Ticket Link')}
                  type="text"
                  value={reason}
                  disabled={isSubmitting}
                  onChange={handleChange('reason')}
                  inputProps={{
                    'data-testid': 'resetReason',
                  }}
                />
              </FieldWrapper>
            </StyledBox>

            <StyledBox marginTop={2}>
              <FieldWrapper>
                <TextField
                  required
                  id="account"
                  label={t('Account Name')}
                  type="text"
                  value={account}
                  disabled={isSubmitting}
                  onChange={handleChange('account')}
                  inputProps={{
                    'data-testid': 'resetAccountName',
                  }}
                />
              </FieldWrapper>
            </StyledBox>

            <DialogActions>
              <SubmitButton
                disabled={!isValid || isSubmitting}
                variant="contained"
              >
                {t('Impersonate User')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </AccordionItem>
  );
};
