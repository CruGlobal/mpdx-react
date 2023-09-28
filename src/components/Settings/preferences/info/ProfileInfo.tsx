import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Box,
  Button,
  Typography,
  useMediaQuery,
  Link,
} from '@mui/material';
import { Theme, styled, useTheme } from '@mui/material/styles';
import { Edit } from '@mui/icons-material';
import { profile2 } from '../DemoContent';
//import { PersPrefModal } from '../modals/PreferencesModal';
// import { PersPrefContactMethods } from './PreferencesContactMethods';
// import { PersPrefAnniversary } from './PreferencesAnniversary';
// import { PersPrefSocials } from './PreferencesSocials';
import { PersonModal } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonModal';
// import { ProfileModal } from 'src/components/Modals/ProfileModal/ProfileModal';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
//import { ContactDetailsTabQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/ContactDetailsTab.generated';

const ProfileInfoWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  [theme.breakpoints.up('sm')]: {
    position: 'relative',
    textAlign: 'left',
    paddingLeft: theme.spacing(14),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
}));

const StyledContactEdit = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
}));

const ContactPersonRowContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const ContactPersonIconContainer = styled(Box)(() => ({
  width: '18px',
  height: '18px',
  marginRight: '15px',
}));

interface ProfileInfoProps {
  //profile: ContactDetailsTabQuery['contact']['people']['nodes'][0];
  accountListId: string;
  data: any;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  accountListId,
  data,
}) => {
  const { t } = useTranslation();
  const profile = profile2;
  const theme = useTheme<Theme>();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const user = data?.user || {};

  // const handleOpen = () => {
  //   setEditProfileModalOpen(true);
  // };

  return (
    <ProfileInfoWrapper component="section">
      <Box marginBottom={isMobile ? theme.spacing(2) : 0}>
        {/* Avatar */}
        <StyledAvatar
          src={profile.avatar}
          alt={`${user?.firstName} ${user?.lastName}`}
        />

        {/* Name */}
        <Typography component="h3" variant="h5">
          {user?.title} {user?.firstName} {user?.lastName} {user?.suffix}
        </Typography>

        {/* Work */}
        {(user?.occupation || user?.employer) && (
          <Typography component="h4">
            {`${user?.occupation} ${
              user?.occupation && user?.employer ? '-' : ''
            } ${user?.employer}`}
          </Typography>
        )}
      </Box>

      {/* Phone Number */}
      {user?.primaryPhoneNumber !== null ? (
        <ContactPersonRowContainer>
          <ContactPersonIconContainer>
            <Phone color="disabled" />
          </ContactPersonIconContainer>
          <Typography variant="subtitle1">
            <Link href={`tel:${user?.primaryPhoneNumber?.number}`}>
              {user?.primaryPhoneNumber?.number}
            </Link>
          </Typography>
          {user?.primaryPhoneNumber?.location ? (
            <Typography variant="caption" marginLeft={1}>
              {t(user?.primaryPhoneNumber?.location)}
            </Typography>
          ) : null}
        </ContactPersonRowContainer>
      ) : null}
      {/* Email Section */}
      {user?.primaryEmailAddress !== null ? (
        <ContactPersonRowContainer>
          <ContactPersonIconContainer>
            <Email color="disabled" />
          </ContactPersonIconContainer>
          <Typography variant="subtitle1">
            <Link href={`mailto:${user?.primaryEmailAddress?.email}`}>
              {user?.primaryEmailAddress?.email}
            </Link>
          </Typography>
        </ContactPersonRowContainer>
      ) : null}

      {/* Edit Info Button */}
      <StyledContactEdit
        onClick={() => setEditProfileModalOpen(true)}
        startIcon={<Edit />}
        variant="outlined"
      >
        {t('Edit')}
      </StyledContactEdit>

      {/* Edit Info Modal */}
      {editProfileModalOpen ? (
        <PersonModal
          accountListId={accountListId}
          handleClose={() => setEditProfileModalOpen(false)}
          userProfile={true}
          contactId=""
        />
      ) : null}
    </ProfileInfoWrapper>
  );
};
