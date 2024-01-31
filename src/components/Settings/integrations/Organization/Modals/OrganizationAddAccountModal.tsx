import React, { ReactElement, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  DialogActions,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { signOut } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { Organization } from 'src/graphql/types.generated';
import { clearDataDogUser } from 'src/hooks/useDataDog';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { articles, showArticle } from 'src/lib/helpScout';
import theme from 'src/theme';
import {
  OrganizationTypesEnum,
  getOrganizationType,
} from '../OrganizationAccordion';
import { getOauthUrl } from '../OrganizationService';
import {
  useCreateOrganizationAccountMutation,
  useGetOrganizationsQuery,
} from '../Organizations.generated';

interface OrganizationAddAccountModalProps {
  handleClose: () => void;
  accountListId: string | undefined;
  refetchOrganizations: () => void;
}

export type OrganizationFormikSchema = {
  selectedOrganization: Pick<
    Organization,
    'id' | 'name' | 'oauth' | 'apiClass' | 'giftAidPercentage'
  >;
  username: string | undefined;
  password: string | undefined;
};

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

const WarningBox = styled(Box)(() => ({
  padding: '15px',
  background: theme.palette.mpdxYellow.main,
  maxWidth: 'calc(100% - 20px)',
  margin: '10px auto 0',
}));

const StyledTypography = styled(Typography)(() => ({
  marginTop: '10px',
  color: theme.palette.mpdxYellow.dark,
}));

export const OrganizationAddAccountModal: React.FC<
  OrganizationAddAccountModalProps
> = ({ handleClose, refetchOrganizations, accountListId }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const [organizationType, setOrganizationType] =
    useState<OrganizationTypesEnum>();
  const [createOrganizationAccount] = useCreateOrganizationAccountMutation();
  const { data: organizations, loading } = useGetOrganizationsQuery();

  const onSubmit = async (attributes: Partial<OrganizationFormikSchema>) => {
    if (!attributes?.selectedOrganization) return;
    const { apiClass, oauth, id } = attributes.selectedOrganization;
    const type = getOrganizationType(apiClass, oauth);

    if (type === OrganizationTypesEnum.OAUTH) {
      enqueueSnackbar(
        t('Redirecting you to complete authentication to connect.'),
        { variant: 'success' },
      );
      window.location.href = await getOauthUrl(id);
      return;
    }

    if (!accountListId) return;

    const createAccountAttributes: {
      organizationId: string;
      password?: string;
      username?: string;
    } = {
      organizationId: id,
    };
    if (attributes.password) {
      createAccountAttributes.password = attributes.password;
    }
    if (attributes.username) {
      createAccountAttributes.username = attributes.username;
    }

    await createOrganizationAccount({
      variables: {
        input: {
          attributes: createAccountAttributes,
        },
      },
      update: () => refetchOrganizations(),
      onError: () => {
        enqueueSnackbar(t('Invalid username or password.'), {
          variant: 'error',
        });
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} added your organization account', { appName }),
          {
            variant: 'success',
          },
        );
      },
    });
    handleClose();
    return;
  };

  const showOrganizationHelp = () => {
    showArticle('HS_SETUP_FIND_ORGANIZATION');
  };

  const OrganizationSchema: yup.SchemaOf<OrganizationFormikSchema> = yup.object(
    {
      selectedOrganization: yup
        .object({
          id: yup.string().required(),
          apiClass: yup.string().required(),
          name: yup.string().required(),
          oauth: yup.boolean().required(),
          giftAidPercentage: yup.number().nullable(),
        })
        .required(),
      username: yup
        .string()
        .when('selectedOrganization', (organization, schema) => {
          if (
            getOrganizationType(organization?.apiClass, organization?.oauth) ===
            OrganizationTypesEnum.LOGIN
          ) {
            return schema.required('Must enter username');
          }
          return schema;
        }),
      password: yup
        .string()
        .when('selectedOrganization', (organization, schema) => {
          if (
            getOrganizationType(organization?.apiClass, organization?.oauth) ===
            OrganizationTypesEnum.LOGIN
          ) {
            return schema.required('Must enter password');
          }
          return schema;
        }),
    },
  );

  return (
    <Modal
      isOpen={true}
      title={t('Add Organization Account')}
      handleClose={handleClose}
      size={'sm'}
    >
      <Formik
        initialValues={{
          selectedOrganization: undefined,
          username: '',
          password: '',
        }}
        validationSchema={OrganizationSchema}
        validateOnMount
        onSubmit={onSubmit}
      >
        {({
          values: { selectedOrganization, username, password },
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            <StyledBox>
              <Autocomplete
                autoSelect
                disabled={isSubmitting}
                autoHighlight
                loading={loading}
                value={selectedOrganization}
                onChange={(_, value) => {
                  setOrganizationType(
                    getOrganizationType(value?.apiClass, value?.oauth),
                  );
                  setFieldValue('selectedOrganization', value);
                }}
                options={
                  organizations?.organizations?.map(
                    (organization) => organization,
                  ) || []
                }
                getOptionLabel={(option) =>
                  organizations?.organizations?.find(
                    ({ id }) => String(id) === String(option.id),
                  )?.name ?? ''
                }
                filterSelectedOptions
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={'Organization'}
                    data-testid="multiSelectFilter"
                  />
                )}
              />
            </StyledBox>

            {!selectedOrganization && !!articles.HS_SETUP_FIND_ORGANIZATION && (
              <Button onClick={showOrganizationHelp}>
                {t("Can't find your organization?")}
              </Button>
            )}

            {organizationType === OrganizationTypesEnum.MINISTRY && (
              <WarningBox>
                <Typography
                  variant="h6"
                  color={theme.palette.mpdxYellow.contrastText}
                >
                  {t('You must log into {{appName}} with your ministry email', {
                    appName,
                  })}
                </Typography>
                <StyledTypography>
                  {t(
                    'This organization requires you to log into {{appName}} with your ministry email to access it.',
                    { appName },
                  )}
                  <ol
                    style={{
                      paddingLeft: '15px',
                    }}
                  >
                    <li>
                      {t('First you need to ')}
                      <Link
                        href="https://thekey.me/cas/logout"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t(
                          'click here to log out of your personal Key account',
                        )}
                      </Link>
                    </li>
                    <li>
                      {t('Next, ')}
                      <Link
                        onClick={() => {
                          signOut({ callbackUrl: 'signOut' }).then(() => {
                            clearDataDogUser();
                          });
                        }}
                      >
                        {t('click here to log out of {{appName}}', { appName })}
                      </Link>
                      {t(
                        ' so you can log back in with your official key account.',
                      )}
                    </li>
                  </ol>
                </StyledTypography>
                <StyledTypography>
                  {t(
                    "If you are already logged in using your ministry account, you'll need to contact your donation services team to request access.",
                  )}
                  {t(
                    "Once this is done you'll need to wait 24 hours for {{appName}} to sync your data.",
                    { appName },
                  )}
                </StyledTypography>
              </WarningBox>
            )}

            {organizationType === OrganizationTypesEnum.OAUTH && (
              <WarningBox>
                <Typography color={theme.palette.mpdxYellow.contrastText}>
                  {t(
                    "You will be taken to your organization's donation services system to grant {{appName}} permission to access your donation data.",
                    { appName },
                  )}
                </Typography>
              </WarningBox>
            )}

            {organizationType === OrganizationTypesEnum.LOGIN && (
              <>
                <StyledBox marginTop={4}>
                  <FieldWrapper>
                    <TextField
                      required
                      id="username"
                      label={t('Username')}
                      value={username}
                      disabled={isSubmitting}
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus={true}
                      onChange={handleChange('username')}
                    />
                  </FieldWrapper>
                </StyledBox>
                <StyledBox marginTop={2}>
                  <FieldWrapper>
                    <TextField
                      required
                      id="password"
                      label={t('Password')}
                      type="password"
                      value={password}
                      disabled={isSubmitting}
                      onChange={handleChange('password')}
                      inputProps={{
                        'data-testid': 'passwordInput',
                      }}
                    />
                  </FieldWrapper>
                </StyledBox>
              </>
            )}

            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />

              <SubmitButton
                disabled={
                  !isValid ||
                  isSubmitting ||
                  organizationType === OrganizationTypesEnum.MINISTRY
                }
              >
                {organizationType !== OrganizationTypesEnum.OAUTH &&
                  t('Add Account')}
                {organizationType === OrganizationTypesEnum.OAUTH &&
                  t('Connect')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
