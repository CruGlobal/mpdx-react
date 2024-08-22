import { useState } from 'react';
import { Alert, Box, Button, Skeleton, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/FieldHelper';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { AccordionProps, StyledServicesButton } from '../integrationsHelper';
import { useOauthUrl } from '../useOauthUrl';
import { DeletePrayerlettersAccountModal } from './Modals/DeletePrayerlettersModal';
import {
  usePrayerlettersAccountQuery,
  useSyncPrayerlettersAccountMutation,
} from './PrayerlettersAccount.generated';

export const PrayerlettersAccordion: React.FC<AccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  disabled,
}) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  showDeleteModal;
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const { getPrayerlettersOauthUrl: getOauthUrl } = useOauthUrl();
  const accountListId = useAccountListId();
  const accordionName = t('prayerletters.com');
  const [syncPrayerlettersAccount] = useSyncPrayerlettersAccountMutation();
  const {
    data,
    loading,
    refetch: refetchPrayerlettersAccount,
  } = usePrayerlettersAccountQuery({
    variables: {
      input: {
        accountListId: accountListId ?? '',
      },
    },
    skip: expandedPanel !== accordionName,
  });

  const prayerlettersAccount = data?.prayerlettersAccount
    ? data?.prayerlettersAccount[0]
    : null;

  const handleSync = async () => {
    setIsSaving(true);

    await syncPrayerlettersAccount({
      variables: {
        input: {
          accountListId: accountListId ?? '',
        },
      },
      onError: () => {
        enqueueSnackbar(
          t(
            "{{appName}} couldn't save your configuration changes for Prayer Letters",
            { appName },
          ),
          {
            variant: 'error',
          },
        );
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(
            '{{appName}} is now syncing your newsletter recipients with Prayer Letters',
            { appName },
          ),
          {
            variant: 'success',
          },
        );
      },
    });

    setIsSaving(false);
  };

  const handleDeleteModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordionName}
      value={''}
      disabled={disabled}
      image={
        <img
          src="/images/settings-preferences-intergrations-prayerletters.svg"
          alt={accordionName}
        />
      }
    >
      {loading && <Skeleton height="90px" />}
      {!loading && !prayerlettersAccount && (
        <>
          <StyledFormLabel>{t('PrayerLetters.com Overview')}</StyledFormLabel>
          <Typography>
            {t(
              `prayerletters.com is a significant way to save valuable ministry
            time while more effectively connecting with your partners. Keep your
            physical newsletter list up to date in {{appName}} and then sync it to your
            prayerletters.com account with this integration.`,
              { appName },
            )}
          </Typography>
          <Alert severity="info">
            {t(
              `By clicking "Connect prayerletters.com Account" you will
            replace your entire prayerletters.com list with what is in {{appName}}. Any
            contacts or information that are in your current prayerletters.com
            list that are not in {{appName}} will be deleted. We strongly recommend
            only making changes in {{appName}}.`,
              { appName },
            )}
          </Alert>
          <StyledServicesButton variant="contained" href={getOauthUrl()}>
            {t('Connect prayerletters.com Account')}
          </StyledServicesButton>
        </>
      )}
      {!loading && prayerlettersAccount && !prayerlettersAccount?.validToken && (
        <>
          <Alert severity="error">
            {t(
              'The link between {{appName}} and your prayerletters.com account stopped working. Click "Refresh prayerletters.com Account" to re-enable it.',
              { appName },
            )}
          </Alert>

          <Box style={{ marginTop: '20px' }}>
            <Button href={getOauthUrl()} variant="contained">
              {t('Refresh prayerletters.com Account')}
            </Button>

            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="text"
              color="error"
              style={{ marginLeft: '15px' }}
              disabled={isSaving}
            >
              {t('Disconnect')}
            </Button>
          </Box>
        </>
      )}
      {!loading && prayerlettersAccount && prayerlettersAccount?.validToken && (
        <>
          <Alert severity="warning">
            <Typography>
              {t(
                `By clicking "Sync Now" you will replace your entire prayerletters.com list with what is in {{appName}}.
              Any contacts or information that are in your current prayerletters.com list that are not in {{appName}}
              will be deleted.`,
                { appName },
              )}
            </Typography>
            <Typography>
              {t('We strongly recommend only making changes in {{appName}}.', {
                appName,
              })}
            </Typography>
          </Alert>

          <Box style={{ marginTop: '20px' }}>
            <Button
              onClick={handleSync}
              variant="contained"
              disabled={isSaving}
            >
              {t('Sync Now')}
            </Button>

            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="text"
              color="error"
              style={{ marginLeft: '15px' }}
              disabled={isSaving}
            >
              {t('Disconnect')}
            </Button>
          </Box>
        </>
      )}
      {showDeleteModal && (
        <DeletePrayerlettersAccountModal
          accountListId={accountListId ?? ''}
          handleClose={handleDeleteModal}
          refetchPrayerlettersAccount={refetchPrayerlettersAccount}
        />
      )}
    </AccordionItem>
  );
};
