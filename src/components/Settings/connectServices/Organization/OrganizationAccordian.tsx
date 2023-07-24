import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Box,
  Button,
  IconButton,
  Typography,
  Card,
  Divider,
} from '@mui/material';
import theme from 'src/theme';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { OrganizationAddAccountModal } from './OrganizationAddAccountModal';
import { useGetUsersOrganizationsQuery } from './Organizations.generated';

interface OrganizationAccordianProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
}

const StyledServicesButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const OrganizationDeleteIconButton = styled(IconButton)(() => ({
  color: theme.palette.cruGrayMedium.main,
  position: 'absolute',
  right: 0,
  '&:disabled': {
    cursor: 'not-allowed',
    pointerEvents: 'all',
  },
}));

export const OrganizationAccordian: React.FC<OrganizationAccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const { data, loading } = useGetUsersOrganizationsQuery();
  const organizations = data?.user.administrativeOrganizations.nodes;

  // console.log('organizations', organizations);
  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={t('Organization')}
      value={''}
      image={
        <img
          src="https://mpdx.org/681865a8b19bbf7a86ee68825106de3f.png"
          alt="Organization"
          style={{
            maxWidth: '80px',
          }}
        />
      }
    >
      <Typography>
        Add or change the organizations that sync donation information with this
        MPDX account. Removing an organization will not remove past information,
        but will prevent future donations and contacts from syncing.
      </Typography>

      {!loading && !organizations?.length && (
        <Typography variant="h5" style={{ marginTop: '20px' }}>
          Let&apos;s start by connecting to your first organization
        </Typography>
      )}

      {!loading && !!organizations?.length && (
        <Box>
          {organizations.map((organization, idx) => (
            <Card key={`organization-${idx}`}>
              <Box
                sx={{
                  p: 1,
                  pl: 2,
                  background: theme.palette.cruGrayLight.main,
                  justifyContent: 'space-between',
                  display: 'flex',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography fontWeight={700}>Organization 1</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <StyledServicesButton
                    variant="contained"
                    size="small"
                    sx={{ m: 0 }}
                  >
                    Sync
                  </StyledServicesButton>
                  <OrganizationDeleteIconButton>
                    <DeleteIcon />
                  </OrganizationDeleteIconButton>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ p: 2, display: 'flex' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    Last Updated
                  </Grid>
                  <Grid item xs={6}>
                    2023-07-13
                  </Grid>
                </Grid>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      <StyledServicesButton
        variant={!!organizations?.length ? 'outlined' : 'contained'}
        onClick={() => setShowAddAccountModal(true)}
      >
        Add Account
      </StyledServicesButton>

      {showAddAccountModal && (
        <OrganizationAddAccountModal
          handleClose={() => setShowAddAccountModal(false)}
        />
      )}
    </AccordionItem>
  );
};
