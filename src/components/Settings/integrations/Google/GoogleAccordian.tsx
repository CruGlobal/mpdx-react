import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Typography,
  List,
  ListItemText,
  Button,
  IconButton,
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { useGoogleAccountsQuery } from './getGoogleAccounts.generated';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import theme from 'src/theme';
import { GoogleAccountAttributes } from '../../../../../graphql/types.generated';
import { EditGoogleAccountModal } from './Modals/EditGoogleAccountModal';

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

export const GoogleAccordian: React.FC<GoogleAccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const [openEditGoogleAccount, setOpenEditGoogleAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    GoogleAccountAttributes | undefined
  >();
  const { data, loading } = useGoogleAccountsQuery({
    skip: !expandedPanel,
  });
  const googleAccounts = data?.getGoogleAccounts;

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setOpenEditGoogleAccount(true);
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
            <StyledServicesButton variant="outlined">
              {t('Add Account')}
            </StyledServicesButton>
          </>
        )}

        {!loading &&
          googleAccounts?.map((account) => (
            <Card
              sx={{ background: theme.palette.cruGrayLight.main, p: 1 }}
              key={account?.remote_id}
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
                  <DeleteIconButton>
                    <DeleteIcon />
                  </DeleteIconButton>
                </Right>
              </Holder>
            </Card>
          ))}
      </AccordionItem>
      {openEditGoogleAccount && (
        <EditGoogleAccountModal
          handleClose={() => setOpenEditGoogleAccount(false)}
          account={selectedAccount}
        />
      )}
    </>
  );
};
