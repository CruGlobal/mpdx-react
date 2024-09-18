import React, { useCallback, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  ButtonProps,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { ConnectOrganization } from 'src/components/Settings/integrations/Organization/ConnectOrganization';
import {
  useDeleteOrganizationAccountMutation,
  useGetUsersOrganizationsAccountsQuery,
} from 'src/components/Settings/integrations/Organization/Organizations.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { SetupPage } from './SetupPage';
import { LargeButton } from './styledComponents';
import { useNextSetupPage } from './useNextSetupPage';

const ButtonGroup = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  gap: theme.spacing(1),
  '.MuiButton-root': {
    flex: 1,
  },
}));

const ButtonContainer = styled(ButtonGroup)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ConnectButton = (props: ButtonProps) => (
  <LargeButton {...props} variant="contained" />
);

export const Connect: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { next } = useNextSetupPage();

  const { data, refetch } = useGetUsersOrganizationsAccountsQuery();
  const organizationAccounts = data?.userOrganizationAccounts;
  const [deleteOrganizationAccount, { loading: deleting }] =
    useDeleteOrganizationAccountMutation();

  const [adding, setAdding] = useState(false);

  const handleDelete = async (organizationAccountId: string) => {
    await deleteOrganizationAccount({
      variables: {
        input: {
          id: organizationAccountId,
        },
      },
      onError: () => {
        enqueueSnackbar(
          t('{{appName}} could not remove your organization account', {
            appName,
          }),
          {
            variant: 'error',
          },
        );
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} removed your organization account', { appName }),
          {
            variant: 'success',
          },
        );
      },
    });
    await refetch();
  };

  const CancelButton = useCallback(
    (props: ButtonProps) => {
      // Remove the cancel button when adding the first organization account
      if (!organizationAccounts || !organizationAccounts.length) {
        return null;
      }

      return <LargeButton variant="outlined" {...props} />;
    },
    [organizationAccounts],
  );

  return (
    <SetupPage
      title={
        organizationAccounts?.length
          ? t("It's time for awesome!")
          : t("It's time to connect!")
      }
    >
      {!organizationAccounts && <CircularProgress />}
      {organizationAccounts?.length === 0 && (
        <>
          <p>
            {t(
              'First, connect your organization to your {{appName}} account.',
              { appName },
            )}
          </p>
          <p>
            {t(
              'This will allow {{appName}} to automatically synchronize your donation information.',
              { appName },
            )}
          </p>
        </>
      )}

      {(adding || organizationAccounts?.length === 0) && (
        <ConnectOrganization
          onDone={() => setAdding(false)}
          ButtonContainer={ButtonContainer}
          CancelButton={CancelButton}
          ConnectButton={ConnectButton}
        />
      )}

      {organizationAccounts && !!organizationAccounts.length && !adding && (
        <>
          <Typography variant="h4">{t("Sweet! You're connected.")}</Typography>
          {organizationAccounts.map(({ id, organization }) => (
            <p key={id}>
              {organization.name}
              <IconButton
                onClick={() => handleDelete(id)}
                disabled={deleting}
                aria-label={t('Disconnect organization')}
              >
                <DeleteIcon />
              </IconButton>
            </p>
          ))}
          {t(
            'Do you receive donations in any other country or from any other organizations?',
          )}
          <ButtonGroup>
            <LargeButton
              variant="outlined"
              onClick={() => setAdding(true)}
              disabled={deleting}
            >
              {t('Yes')}
            </LargeButton>
            <LargeButton variant="contained" disabled={deleting} onClick={next}>
              {t('No')}
            </LargeButton>
          </ButtonGroup>
        </>
      )}
    </SetupPage>
  );
};
