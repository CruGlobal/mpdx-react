import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useApolloClient } from '@apollo/client';
import {
  Box,
  Button,
  ButtonProps,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { signOut } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { StyledBox } from 'src/components/Shared/styledComponents/StyledBox';
import { OrganizationAutocomplete } from 'src/components/common/Autocomplete/OrganizationAutocomplete/OrganizationAutocomplete';
import { Organization } from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { clearDataDogUser } from 'src/lib/dataDog';
import { articles } from 'src/lib/helpjuice';
import theme from 'src/theme';
import { useOauthUrl } from '../useOauthUrl';
import {
  OrganizationTypesEnum,
  getOrganizationType,
} from './OrganizationAccordion';
import {
  useCreateOrganizationAccountMutation,
  useGetOrganizationsQuery,
} from './Organizations.generated';
import { OrganizationFormikSchema, OrganizationSchema } from './schema';

interface ConnectOrganizationProps {
  onDone: () => void;
  ButtonContainer?: React.FC<{ children: ReactNode }>;
  CancelButton?: React.FC<ButtonProps>;
  ConnectButton?: React.FC<ButtonProps>;
  ContentContainer?: React.FC<{ children: ReactNode }>;
}

const StyledForm = styled('form')({ width: '100%' });

const WarningBox = styled(Box)({
  padding: '15px',
  background: theme.palette.mpdxYellow.main,
  maxWidth: 'calc(100% - 20px)',
  margin: '10px auto 0',
});

const StyledTypography = styled(Typography)({
  marginTop: '10px',
  color: theme.palette.mpdxYellow.dark,
});

export const ConnectOrganization: React.FC<ConnectOrganizationProps> = ({
  onDone,
  ButtonContainer = Box,
  CancelButton = Button,
  ConnectButton = Button,
  ContentContainer = Box,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const client = useApolloClient();
  const [organizationType, setOrganizationType] =
    useState<OrganizationTypesEnum>();
  const [selectedOrg, setSelectedOrg] = useState('');

  const [createOrganizationAccount] = useCreateOrganizationAccountMutation();
  const { data: organizations, loading } = useGetOrganizationsQuery();

  const { getOrganizationOauthUrl: getOauthUrl } = useOauthUrl();

  const onSubmit = async (attributes: Partial<OrganizationFormikSchema>) => {
    if (!attributes?.selectedOrganization) {
      return;
    }
    const { apiClass, oauth, id } = attributes.selectedOrganization;
    const type = getOrganizationType(apiClass, oauth);

    if (type === OrganizationTypesEnum.OAUTH) {
      enqueueSnackbar(
        t('Redirecting you to complete authentication to connect.'),
        { variant: 'success' },
      );
      window.location.href = getOauthUrl(id);
      return;
    }

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
      refetchQueries: ['GetUsersOrganizationsAccounts'],
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
    onDone();
  };

  const donationServicesEmailLink = useMemo(
    () =>
      `mailto:${
        process.env.DONATION_SERVICES_EMAIL
      }?subject=Request+access+to+ministry+organization&body=${encodeURIComponent(
        'Dear Donation Services,\n\nI hope this message finds you well. I would like to request that my MPDX account be linked to the following organization:' +
          `\n\nOrganization name: ${selectedOrg}` +
          '\n\nThank you for your assistance,\n\n',
      )}`,
    [selectedOrg],
  );

  const focusOnOrganization = useCallback((ref) => {
    ref?.focus();
  }, []);

  return (
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
        <StyledForm onSubmit={handleSubmit}>
          <ContentContainer>
            <OrganizationAutocomplete
              disabled={isSubmitting}
              autoHighlight
              fullWidth
              loading={loading}
              value={selectedOrganization}
              organizations={
                organizations?.organizations?.filter(
                  (organization) => !organization?.disableNewUsers,
                ) ?? []
              }
              onChange={(_, value) => {
                const org = value as Organization;
                setOrganizationType(
                  getOrganizationType(org?.apiClass, org?.oauth),
                );
                setSelectedOrg(org?.name ?? '');
                setFieldValue('selectedOrganization', value);
              }}
              textFieldFocusRef={focusOnOrganization}
            />
            {!selectedOrganization &&
              articles.HELP_URL_SETUP_FIND_ORGANIZATION && (
                <Button
                  href={articles.HELP_URL_SETUP_FIND_ORGANIZATION}
                  target="_blank"
                >
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
                      <Link
                        onClick={() => {
                          signOut({ callbackUrl: 'signOut' }).then(() => {
                            clearDataDogUser();
                            client.clearStore();
                          });
                        }}
                      >
                        {t('Click here to log out of {{appName}}', {
                          appName,
                        })}
                      </Link>
                      {t(
                        ' so you can log back in with your official ministry email.',
                      )}
                    </li>
                  </ol>
                </StyledTypography>
                <StyledTypography fontStyle="italic">
                  {t(
                    "If you are already logged in using your ministry account, you'll need to ",
                  )}
                  <Link href={donationServicesEmailLink} target="_blank">
                    {t(
                      'contact your donation services team to request access.',
                    )}
                  </Link>{' '}
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
          </ContentContainer>
          <ButtonContainer>
            <CancelButton onClick={onDone} disabled={isSubmitting}>
              {t('Cancel')}
            </CancelButton>
            <ConnectButton
              type="submit"
              disabled={
                !isValid ||
                isSubmitting ||
                organizationType === OrganizationTypesEnum.MINISTRY
              }
            >
              {organizationType === OrganizationTypesEnum.OAUTH
                ? t('Connect')
                : t('Add Account')}
            </ConnectButton>
          </ButtonContainer>
        </StyledForm>
      )}
    </Formik>
  );
};
