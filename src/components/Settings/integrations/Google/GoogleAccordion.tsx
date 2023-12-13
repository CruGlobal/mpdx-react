import { useContext, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Card,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  IntegrationsContext,
  IntegrationsContextType,
} from 'pages/accountLists/[accountListId]/settings/integrations/IntegrationsContext';
import HandoffLink from 'src/components/HandoffLink';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/FieldHelper';
import { GoogleAccountAttributes } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from 'src/theme';
import {
  StyledList,
  StyledListItem,
  StyledServicesButton,
} from '../integrationsHelper';
import { useGoogleAccountsQuery } from './GoogleAccounts.generated';
import { DeleteGoogleAccountModal } from './Modals/DeleteGoogleAccountModal';
import { EditGoogleAccountModal } from './Modals/EditGoogleAccountModal';

interface GoogleAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
}

const EditIconButton = styled(IconButton)(() => ({
  color: theme.palette.primary.main,
  marginLeft: '10px',
  '&:disabled': {
    cursor: 'not-allowed',
    pointerEvents: 'all',
  },
}));
const DeleteIconButton = styled(IconButton)(() => ({
  color: theme.palette.cruGrayMedium.main,
  marginLeft: '10px',
  '&:disabled': {
    cursor: 'not-allowed',
    pointerEvents: 'all',
  },
}));

const Holder = styled(Box)(() => ({
  display: 'flex',
  gap: '10px',
  justifyContent: 'spaceBetween',
  alignItems: 'center',
}));

const Left = styled(Box)(() => ({
  width: 'calc(100% - 80px)',
}));

const Right = styled(Box)(() => ({
  width: '120px',
}));

export type GoogleAccountAttributesSlimmed = Pick<
  GoogleAccountAttributes,
  'id' | 'email' | 'primary' | 'remoteId' | 'tokenExpired'
>;

export const GoogleAccordion: React.FC<GoogleAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const [openEditGoogleAccount, setOpenEditGoogleAccount] = useState(false);
  const [openDeleteGoogleAccount, setOpenDeleteGoogleAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    GoogleAccountAttributesSlimmed | undefined
  >();
  const { data, loading } = useGoogleAccountsQuery({
    skip: !expandedPanel,
  });
  const googleAccounts = data?.googleAccounts;
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();
  const { apiToken } = useContext(
    IntegrationsContext,
  ) as IntegrationsContextType;

  const oAuth = `${
    process.env.OAUTH_URL
  }/auth/user/google?account_list_id=${accountListId}&redirect_to=${encodeURIComponent(
    `${process.env.SITE_URL}/accountLists/${accountListId}/settings/integrations?selectedTab=Google`,
  )}&access_token=${apiToken}`;

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setOpenEditGoogleAccount(true);
  };
  const handleDeleteAccount = async (account) => {
    setSelectedAccount(account);
    setOpenDeleteGoogleAccount(true);
  };
  return (
    <>
      <AccordionItem
        onAccordionChange={handleAccordionChange}
        expandedPanel={expandedPanel}
        label={t('Google')}
        value={''}
        image={
          <img
            src="/images/settings-preferences-intergrations-google.png"
            alt="Google"
            style={{
              maxWidth: '80px',
            }}
          />
        }
      >
        {loading && <Skeleton height="90px" />}
        {!loading && !googleAccounts?.length && !!expandedPanel && (
          <>
            <StyledFormLabel>
              {t('Google Integration Overview')}
            </StyledFormLabel>
            <Typography>
              {t(`Google’s suite of tools are great at connecting you to your
              Ministry Partners.`)}
            </Typography>
            <Typography mt={2}>
              {t(
                `By synchronizing your Google services with {{appName}}, you will be able
              to:`,
                { appName },
              )}
            </Typography>
            <StyledList>
              <StyledListItem>
                {t('See {{appName}} tasks in your Google Calendar', {
                  appName,
                })}
              </StyledListItem>
              <StyledListItem>
                {t('Import Google Contacts into {{appName}}', { appName })}
              </StyledListItem>
              <StyledListItem>
                {t('Keep your Contacts in sync with your Google Contacts')}
              </StyledListItem>
            </StyledList>
            <Typography>
              {t(
                `Connect your Google account to begin, and then setup specific
              settings for Google Calendar and Contacts. {{appName}} leaves you in
              control of how each service stays in sync.`,
                { appName },
              )}
            </Typography>
          </>
        )}

        {!loading &&
          googleAccounts?.map((account) => (
            <Card
              sx={{
                background: theme.palette.cruGrayLight.main,
                p: 1,
              }}
              key={account?.remoteId}
              style={{ marginTop: '15px' }}
            >
              <Holder>
                <Left>
                  <Typography>{account?.email}</Typography>
                </Left>
                <Right>
                  <EditIconButton onClick={() => handleEditAccount(account)}>
                    <EditIcon />
                  </EditIconButton>
                  <DeleteIconButton
                    onClick={() => handleDeleteAccount(account)}
                  >
                    <DeleteIcon />
                  </DeleteIconButton>
                </Right>
              </Holder>
              {account?.tokenExpired && (
                <>
                  <Alert severity="warning" style={{ marginTop: '15px' }}>
                    {t(
                      `The link between {{appName}} and your Google account stopped working. Click "Refresh Google Account" to
              re-enable it. After that, you'll need to manually re-enable any integrations that you had set
              already.`,
                      { appName },
                    )}
                  </Alert>
                  <StyledServicesButton variant="outlined" href={oAuth}>
                    {t('Refresh Google Account')}
                  </StyledServicesButton>
                </>
              )}
            </Card>
          ))}
        <Box>
          <StyledServicesButton variant="contained" href={oAuth}>
            {t('Add Account')}
          </StyledServicesButton>

          {googleAccounts?.length && (
            <HandoffLink path="/tools/import/google">
              <StyledServicesButton
                variant="outlined"
                style={{ marginLeft: '15px' }}
              >
                {t('Import contacts')}
              </StyledServicesButton>
            </HandoffLink>
          )}
        </Box>
      </AccordionItem>
      {openEditGoogleAccount && selectedAccount && (
        <EditGoogleAccountModal
          handleClose={() => setOpenEditGoogleAccount(false)}
          account={selectedAccount}
          oAuth={oAuth}
        />
      )}
      {openDeleteGoogleAccount && selectedAccount && (
        <DeleteGoogleAccountModal
          handleClose={() => setOpenDeleteGoogleAccount(false)}
          account={selectedAccount}
        />
      )}
    </>
  );
};
