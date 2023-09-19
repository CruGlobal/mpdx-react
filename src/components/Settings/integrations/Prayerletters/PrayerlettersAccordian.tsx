import { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Box, Typography, Skeleton, Alert, Button } from '@mui/material';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import {
  IntegrationsContext,
  IntegrationsContextType,
} from 'pages/accountLists/[accountListId]/settings/integrations.page';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledServicesButton, AccordianProps } from '../../accordianHelper';
import {
  useGetPrayerlettersAccountQuery,
  useSyncPrayerlettersAccountMutation,
} from './PrayerlettersAccount.generated';
import { DeletePrayerlettersAccountModal } from './Modals/DeletePrayerlettersModal';

export const PrayerlettersAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const [oAuth, setOAuth] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  showDeleteModal;
  const { enqueueSnackbar } = useSnackbar();
  const { apiToken } = useContext(
    IntegrationsContext,
  ) as IntegrationsContextType;
  const accountListId = useAccountListId();
  const accordianName = t('prayerletters.com');
  const [syncPrayerlettersAccount] = useSyncPrayerlettersAccountMutation();
  const {
    data,
    loading,
    refetch: refetchPrayerlettersAccount,
  } = useGetPrayerlettersAccountQuery({
    variables: {
      input: {
        accountListId: accountListId ?? '',
      },
    },
    skip: expandedPanel !== accordianName,
  });

  const prayerlettersAccount = data?.getPrayerlettersAccount
    ? data?.getPrayerlettersAccount[0]
    : null;

  useEffect(() => {
    setOAuth(
      `${
        process.env.OAUTH_URL
      }/auth/user/prayer_letters?account_list_id=${accountListId}&redirect_to=${window.encodeURIComponent(
        `${window.location.origin}/accountLists/${accountListId}/settings/integrations?selectedTab=prayerletters.com`,
      )}&access_token=${apiToken}`,
    );
  }, []);

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
          t("MPDX couldn't save your configuration changes for Prayer Letters"),
          {
            variant: 'error',
          },
        );
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(
            'MPDX is now syncing your newsletter recipients with Prayer Letters',
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
      label={accordianName}
      value={''}
      image={
        <img
          src="https://mpdx.org/567678cfd0a51220933a5b5b62aeae11.svg"
          alt={accordianName}
        />
      }
    >
      {loading && <Skeleton height="90px" />}
      {!loading && !prayerlettersAccount && (
        <>
          <StyledFormLabel>{t('PrayerLetters.com Overview')}</StyledFormLabel>
          <Typography>
            {t(`prayerletters.com is a significant way to save valuable ministry
            time while more effectively connecting with your partners. Keep your
            physical newsletter list up to date in MPDX and then sync it to your
            prayerletters.com account with this integration.`)}
          </Typography>
          <Alert severity="info">
            {t(`By clicking "Connect prayerletters.com Account" you will
            replace your entire prayerletters.com list with what is in MPDX. Any
            contacts or information that are in your current prayerletters.com
            list that are not in MPDX will be deleted. We strongly recommend
            only making changes in MPDX.`)}
          </Alert>
          <StyledServicesButton variant="contained" href={oAuth}>
            {t('Connect prayerletters.com Account')}
          </StyledServicesButton>
        </>
      )}
      {!loading && prayerlettersAccount && !prayerlettersAccount?.validToken && (
        <>
          <Alert severity="error">
            {t(
              'The link between MPDX and your prayerletters.com account stopped working. Click "Refresh prayerletters.com Account" to re-enable it.',
            )}
          </Alert>

          <Box style={{ marginTop: '20px' }}>
            <Button href={oAuth} variant="contained">
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
                `By clicking "Sync Now" you will replace your entire prayerletters.com list with what is in MPDX.
              Any contacts or information that are in your current prayerletters.com list that are not in MPDX
              will be deleted.`,
              )}
            </Typography>
            <Typography>
              {t('We strongly recommend only making changes in MPDX.')}
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
