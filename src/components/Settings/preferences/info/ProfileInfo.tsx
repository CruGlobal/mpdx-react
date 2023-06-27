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
// import { profile } from '../DemoContent';
//import { PersPrefModal } from '../modals/PreferencesModal';
// import { PersPrefContactMethods } from './PreferencesContactMethods';
// import { PersPrefAnniversary } from './PreferencesAnniversary';
// import { PersPrefSocials } from './PreferencesSocials';
import { ProfileModal } from 'src/components/Modals/ProfileModal/ProfileModal';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';

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

export const ProfileInfo: React.FC = ({ accountListId, profile }) => {
  const { t } = useTranslation();

  const theme = useTheme<Theme>();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  const primaryPhone = profile.phoneNumbers.nodes.filter(
    (item) => item.primary === true,
  )[0];

  const primaryEmail = profile.emailAddresses.nodes.filter(
    (item) => item.primary === true,
  )[0];

  // const handleOpen = () => {
  //   setEditProfileModalOpen(true);
  // };

  return (
    <ProfileInfoWrapper component="section">
      <Box marginBottom={isMobile ? theme.spacing(2) : 0}>
        {/* Avatar */}
        <StyledAvatar
          src={profile.avatar}
          alt={`${profile.first_name} ${profile.last_name}`}
        />

        {/* Name */}
        <Typography component="h3" variant="h5">
          {t(profile.title)} {profile.firstName} {profile.lastName}{' '}
          {t(profile.suffix)}
        </Typography>

        {/* Work */}
        {(profile.occupation || profile.employer) && (
          <Typography component="h4">
            {`${profile.occupation} ${
              profile.occupation && profile.employer ? '-' : ''
            } ${profile.employer}`}
          </Typography>
        )}
      </Box>

      {/* Email */}
      {/* <PersPrefContactMethods type="email" methods={profile.email} /> */}

      {/* Phone Number */}
      {primaryPhone !== null ? (
        <ContactPersonRowContainer>
          <ContactPersonIconContainer>
            <Phone color="disabled" />
          </ContactPersonIconContainer>
          <Typography variant="subtitle1">
            <Link href={`tel:${primaryPhone?.number}`}>
              {primaryPhone?.number}
            </Link>
          </Typography>
          {primaryPhone?.location ? (
            <Typography variant="caption" marginLeft={1}>
              {t(primaryPhone.location)}
            </Typography>
          ) : null}
        </ContactPersonRowContainer>
      ) : null}
      {/* Email Section */}
      {primaryEmail !== null ? (
        <ContactPersonRowContainer>
          <ContactPersonIconContainer>
            <Email color="disabled" />
          </ContactPersonIconContainer>
          <Typography variant="subtitle1">
            <Link href={`mailto:${primaryEmail?.email}`}>
              {primaryEmail?.email}
            </Link>
          </Typography>
        </ContactPersonRowContainer>
      ) : null}

      {/* Phone */}
      {/* <PersPrefContactMethods type="phone" methods={profile.phone} /> */}

      {/* Anniversay */}
      {/* <PersPrefAnniversary
        marital_status={t(profile.marital_status)}
        anniversary_day={profile.anniversary_day}
        anniversary_month={profile.anniversary_month}
        anniversary_year={profile.anniversary_year}
      /> */}

      {/* Social Media */}
      {/* <PersPrefSocials
        facebook_accounts={profile.facebook_accounts}
        twitter_accounts={profile.twitter_accounts}
        linkedin_accounts={profile.linkedin_accounts}
        websites={profile.websites}
      /> */}

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
        <ProfileModal
          person={profile}
          accountListId={accountListId}
          handleClose={() => setEditProfileModalOpen(false)}
        />
      ) : null}
    </ProfileInfoWrapper>
  );
};
