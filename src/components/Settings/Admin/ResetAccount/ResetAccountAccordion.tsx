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

type ImpersonateUserFormType = {
  user: string;
  account: string;
  reason?: string;
};

const ImpersonateUserSchema: yup.ObjectSchema<ImpersonateUserFormType> =
  yup.object({
    user: yup.string().email().required(),
    account: yup.string().required(),
    reason: yup.string(),
  });

export const ResetAccountAccordion: React.FC<AccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordionName = t('Reset Account');
  const { enqueueSnackbar } = useSnackbar();
  const [resetAccountList] = useResetAccountListMutation();

  const onSubmit = async (
    attributes: ImpersonateUserFormType,
    resetForm: () => void,
  ) => {
    const { user, account, reason } = attributes;

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
      label={accordionName}
      value={''}
    >
      <StyledFormLabel>{accordionName}</StyledFormLabel>
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
                  label={t('Okta User Name / Email')}
                  type="email"
                  value={user}
                  disabled={isSubmitting}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
                  onChange={handleChange('user')}
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
                  label={t('Reason / HelpScout Ticket Link')}
                  type="text"
                  value={reason}
                  disabled={isSubmitting}
                  onChange={handleChange('reason')}
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
                />
              </FieldWrapper>
            </StyledBox>

            <DialogActions>
              <SubmitButton
                disabled={!isValid || isSubmitting}
                variant="contained"
              >
                {t('Reset Account')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </AccordionItem>
  );
};
