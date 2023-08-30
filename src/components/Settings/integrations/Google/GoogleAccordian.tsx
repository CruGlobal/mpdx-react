import { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Card,
  List,
  ListItemText,
  IconButton,
  Typography,
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { useGoogleAccountsQuery } from './googleAccounts.generated';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from 'src/theme';
import { GoogleAccountAttributes } from '../../../../../graphql/types.generated';
import { EditGoogleAccountModal } from './Modals/EditGoogleAccountModal';
import { DeleteGoogleAccountModal } from './Modals/DeleteGoogleAccountModal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  IntegrationsContext,
  IntegrationsContextType,
} from 'pages/accountLists/[accountListId]/settings/integrations.page';
import HandoffLink from 'src/components/HandoffLink';

interface GoogleAccordianProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
}

const StyledListItem = styled(ListItemText)(() => ({
  display: 'list-item',
}));
const StyledList = styled(List)(({ theme }) => ({
  listStyleType: 'disc',
  paddingLeft: theme.spacing(4),
}));

const StyledServicesButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

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

export const GoogleAccordian: React.FC<GoogleAccordianProps> = ({
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
  const googleAccounts = data?.getGoogleAccounts;
  const accountListId = useAccountListId();
  const [oAuth, setOAuth] = useState('');

  useEffect(() => {
    setOAuth(
      `${
        process.env.OAUTH_URL
      }/auth/user/google?account_list_id=${accountListId}&redirect_to=${window.encodeURIComponent(
        `${window.location.origin}/accountLists/${accountListId}/settings/integrations?selectedTab=Google`,
      )}&access_token=${apiToken}`,
    );
  }, []);

  const { apiToken } = useContext(
    IntegrationsContext,
  ) as IntegrationsContextType;

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
            <StyledFormLabel>Google Integration Overview</StyledFormLabel>
            <Typography>
              Google’s suite of tools are great at connecting you to your
              Ministry Partners.
            </Typography>
            <Typography mt={2}>
              By synchronizing your Google services with MPDX, you will be able
              to:
            </Typography>
            <StyledList>
              <StyledListItem>
                See MPDX tasks in your Google Calendar
              </StyledListItem>
              <StyledListItem>Import Google Contacts into MPDX</StyledListItem>
              <StyledListItem>
                Keep your Contacts in sync with your Google Contacts
              </StyledListItem>
            </StyledList>
            <Typography>
              Connect your Google account to begin, and then setup specific
              settings for Google Calendar and Contacts. MPDX leaves you in
              control of how each service stays in sync.
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
                    {t(`The link between MPDX and your Google account stopped working. Click "Refresh Google Account" to
              re-enable it. After that, you'll need to manually re-enable any integrations that you had set
              already.`)}
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

          {!!googleAccounts?.length && (
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
