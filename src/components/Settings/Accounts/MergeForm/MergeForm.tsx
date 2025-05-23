import { ReactElement } from 'react';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { DialogActionsLeft } from 'src/components/Shared/Forms/DialogActions';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from 'src/theme';
import {
  useAccountListQuery,
  useGetAccountListsForMergingQuery,
  useMergeAccountListMutation,
} from './MergeForm.generated';

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

const BorderBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSpouse',
})(({ isSpouse }: { isSpouse: boolean }) => ({
  border: isSpouse ? '1px solid' : 'none',
  borderColor: theme.palette.yellow.main,
  borderRadius: theme.shape.borderRadius,
  padding: isSpouse ? '10px' : '0',
}));

type FormikSchema = {
  selectedAccountId: string;
  accept: boolean;
};

const formikSchema: yup.ObjectSchema<FormikSchema> = yup.object({
  selectedAccountId: yup.string().required(),
  accept: yup.boolean().oneOf([true], 'Field must be checked').required(),
});

type MergeFormProps = {
  isSpouse: boolean;
};

export const MergeForm: React.FC<MergeFormProps> = ({ isSpouse }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId() || '';
  const { data } = useGetAccountListsForMergingQuery();
  const { appName } = useGetAppSettings();
  const { data: currentAccountList } = useAccountListQuery({
    variables: {
      accountListId,
    },
  });
  const [mergeAccountList] = useMergeAccountListMutation();

  const currentAccount = currentAccountList?.accountList;
  const accountLists = data?.accountLists.nodes.filter(
    (account) => account.id !== currentAccount?.id,
  );

  const onSubmit = async (attributes: FormikSchema) => {
    const { selectedAccountId, accept } = attributes;
    if (!currentAccount?.id || !accept) {
      return;
    }

    await mergeAccountList({
      variables: {
        input: {
          losingAccountListId: selectedAccountId,
          winningAccountListId: currentAccount.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `AccountList:${selectedAccountId}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} merged your account successfully', { appName }),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(
          t("{{appName}} couldn't merge your account", { appName }),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  return (
    <>
      <Typography component="div">
        <p>
          {t(
            'Merge multiple personal donation accounts into one with Multi-currency support',
          )}
        </p>
        <p>
          {t(
            `If you have personal donation accounts in different countries or organizations, you can bring them into one view in
            {{appName}}. Though the actual donation accounts will remain separate within their respective organizations, they will be
            merged together in {{appName}} permanently.`,
            { appName },
          )}
        </p>
      </Typography>

      <Alert severity="error" style={{ marginTop: '15px' }}>
        <p>
          {t(
            `THIS MERGE WILL AFFECT ALL PEOPLE WITH ACCESS TO THIS ACCOUNT AND CANNOT BE UNDONE`,
          )}
        </p>
        <p>
          {t(`DO NOT MERGE MINISTRY ACCOUNTS THROUGH {{appName}}`, { appName })}
        </p>
      </Alert>

      {accountLists && !accountLists.length && (
        <Alert severity="warning" style={{ marginTop: '15px' }}>
          <p>
            {t(`You only have access to this account, so you cannot merge it with another one yet. Share this account with
              someone else first. Once they accept your share, you will be able to merge your accounts together.`)}
          </p>
        </Alert>
      )}

      <Formik
        initialValues={{
          selectedAccountId: '',
          accept: false,
        }}
        validationSchema={formikSchema}
        isInitialValid={false}
        onSubmit={onSubmit}
      >
        {({
          values: { selectedAccountId, accept },
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          errors,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            {accountLists && !!accountLists.length && (
              <>
                <Grid
                  container
                  spacing={2}
                  style={{ marginTop: isSpouse ? 4 : 0 }}
                >
                  <Grid item sm={isSpouse ? 5.5 : 12} xs={12}>
                    <BorderBox isSpouse={isSpouse} marginTop={isSpouse ? 0 : 4}>
                      <Typography
                        style={{
                          marginBottom: '10px',
                          textAlign: isSpouse ? 'center' : 'left',
                        }}
                      >
                        {t('Merging From')}
                      </Typography>
                      <FieldWrapper>
                        <InputLabel id="selectedAccountIdLabel">
                          {t('Select an Account')}
                        </InputLabel>
                        <Select
                          labelId="selectedAccountIdLabel"
                          value={selectedAccountId}
                          name="selectedAccountId"
                          onChange={handleChange}
                          label={t('Select an Account')}
                        >
                          {accountLists.map((account) => (
                            <MenuItem key={account.id} value={account.id}>
                              {account.name}
                              <Typography
                                variant="body2"
                                color={theme.palette.mpdxGrayLight.light}
                                marginLeft="5px"
                              >
                                ({account.id})
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.selectedAccountId && (
                          <FormHelperText error={true}>
                            {t('This field is required')}
                          </FormHelperText>
                        )}
                      </FieldWrapper>
                    </BorderBox>
                  </Grid>

                  {isSpouse && (
                    <Grid
                      item
                      sm={1}
                      xs={12}
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <KeyboardArrowRightIcon
                        color="success"
                        fontSize="large"
                        data-testid="KeyboardArrowRightIcon"
                      />
                    </Grid>
                  )}
                  <Grid item sm={isSpouse ? 5.5 : 12} xs={12}>
                    {currentAccount && (
                      <BorderBox
                        isSpouse={isSpouse}
                        marginTop={isSpouse ? 0 : 4}
                        style={{
                          borderColor: theme.palette.success.main,
                        }}
                      >
                        <Typography
                          style={{
                            marginBottom: '10px',
                            textAlign: isSpouse ? 'center' : 'left',
                          }}
                        >
                          {t('Merging Into')}
                        </Typography>
                        <FieldWrapper>
                          <Select
                            value={currentAccount.id}
                            name="currentAccount"
                            disabled={true}
                          >
                            <MenuItem value={currentAccount.id}>
                              {currentAccount.name}
                              <Typography
                                variant="body2"
                                color={theme.palette.mpdxGrayLight.light}
                                marginLeft="5px"
                              >
                                ({currentAccount.id})
                              </Typography>
                            </MenuItem>
                          </Select>
                        </FieldWrapper>
                      </BorderBox>
                    )}
                  </Grid>
                </Grid>
                <StyledBox marginTop={4}>
                  <FieldWrapper>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="accept"
                          checked={accept}
                          onChange={handleChange}
                        />
                      }
                      label={t(
                        'This account merge cannot be undone, I accept.',
                      )}
                    />
                    {errors.accept && (
                      <FormHelperText error={true}>
                        {t('This field is required')}
                      </FormHelperText>
                    )}
                  </FieldWrapper>
                </StyledBox>

                <DialogActionsLeft>
                  <SubmitButton
                    disabled={!isValid || isSubmitting}
                    variant="contained"
                  >
                    {t('Merge')}
                  </SubmitButton>
                </DialogActionsLeft>
              </>
            )}
          </form>
        )}
      </Formik>
    </>
  );
};
