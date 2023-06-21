import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Button, Typography, useMediaQuery } from '@mui/material';
import { Theme, styled, useTheme } from '@mui/material/styles';
import { Edit } from '@mui/icons-material';
import { profile } from '../DemoContent';
import { PersPrefModal } from '../modals/PersPrefModal';
import { PersPrefContactMethods } from './PersPrefContactMethods';
import { PersPrefAnniversary } from './PersPrefAnniversary';
import { PersPrefSocials } from './PersPrefSocials';

const PersPrefInfoWrapper = styled(Box)(({ theme }) => ({
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

export const PersPrefInfo: React.FC = () => {
  const { t } = useTranslation();

  const theme = useTheme<Theme>();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const [profileOpen, setProfileOpen] = useState(false);

  const handleOpen = () => {
    setProfileOpen(true);
  };

  return (
    <PersPrefInfoWrapper component="section">
      <Box marginBottom={isMobile ? theme.spacing(2) : 0}>
        {/* Avatar */}
        <StyledAvatar
          src={profile.avatar}
          alt={`${profile.first_name} ${profile.last_name}`}
        />

        {/* Name */}
        <Typography component="h3" variant="h5">
          {t(profile.title)} {profile.first_name} {profile.last_name}{' '}
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
      <PersPrefContactMethods type="email" methods={profile.email} />

      {/* Phone */}
      <PersPrefContactMethods type="phone" methods={profile.phone} />

      {/* Anniversay */}
      <PersPrefAnniversary
        marital_status={t(profile.marital_status)}
        anniversary_day={profile.anniversary_day}
        anniversary_month={profile.anniversary_month}
        anniversary_year={profile.anniversary_year}
      />

      {/* Social Media */}
      <PersPrefSocials
        facebook_accounts={profile.facebook_accounts}
        twitter_accounts={profile.twitter_accounts}
        linkedin_accounts={profile.linkedin_accounts}
        websites={profile.websites}
      />

      {/* Edit Info Button */}
      <StyledContactEdit
        onClick={handleOpen}
        startIcon={<Edit />}
        variant="outlined"
      >
        {t('Edit')}
      </StyledContactEdit>

      {/* Edit Info Modal */}
      {profileOpen ? (
        <PersPrefModal handleClose={() => setProfileOpen(false)} />
      ) : null}
    </PersPrefInfoWrapper>
  );
};
