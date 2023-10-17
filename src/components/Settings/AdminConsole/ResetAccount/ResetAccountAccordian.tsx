import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  Typography,
  DialogActions,
  TextField,
  FormHelperText,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { AccordianProps } from '../../accordianHelper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

export const ResetAccountAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordianName = t('Reset Account');
  const { enqueueSnackbar } = useSnackbar();

  type ImpersonateUserFormType = {
    user: string;
    account: string;
    reason?: string;
  };

  const ImpersonateUserSchema: yup.SchemaOf<ImpersonateUserFormType> =
    yup.object({
      user: yup.string().email().required(),
      reason: yup.string(),
      account: yup.string().required(),
    });

  const onSubmit = async (attributes: ImpersonateUserFormType) => {
    // const { user, reason, account } = attributes;

    // eslint-disable-next-line no-console
    console.log('onSubmit', attributes);

    // Need to build
    // await adminDeleteOrganizationInvite({
    //   variables: {
    //     input: {
    //       accountListId,
    //       inviteId: invite.id,
    //     },
    //   },
    //   update: (cache) => {
    //     cache.evict({ id: `AccountListInvites:${invite.id}` });
    //     cache.gc();
    //   },
    //   onCompleted: () => {
    enqueueSnackbar(t('Successfully reset account'), {
      variant: 'success',
    });
    //   },
    //   onError: () => {
    //     enqueueSnackbar(t('Unable to reset account'), {
    //       variant: 'error',
    //     });
    //   },
    // });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordianName}
      value={''}
    >
      <StyledFormLabel>{accordianName}</StyledFormLabel>
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
        onSubmit={onSubmit}
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
                  label={t('User Name, ID or Key/Relay Email')}
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
                  label={t('Reason / Helpscout Ticket Link')}
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
                {t('Impersonate User')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </AccordionItem>
  );
};
