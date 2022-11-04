import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit } from '@mui/icons-material';
import { info } from '../DemoContent';
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

const StyledContactTop = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    marginBottom: 0,
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

  const [profileOpen, setProfileOpen] = useState(false);

  const handleOpen = () => {
    setProfileOpen(true);
  };

  return (
    <PersPrefInfoWrapper component="section">
      <StyledContactTop>
        {/* Avatar */}
        <StyledAvatar
          src={info.avatar}
          alt={`${info.first_name} ${info.last_name}`}
        />

        {/* Name */}
        <Typography component="h3" variant="h5">
          {t(info.title)} {info.first_name} {info.last_name} {t(info.suffix)}
        </Typography>

        {/* Work */}
        {(info.occupation || info.employer) && (
          <Typography component="h4">
            {`${info.occupation} ${
              info.occupation && info.employer ? '-' : ''
            } ${info.employer}`}
          </Typography>
        )}
      </StyledContactTop>

      {/* Email */}
      <PersPrefContactMethods type="email" methods={info.email} />

      {/* Phone */}
      <PersPrefContactMethods type="phone" methods={info.phone} />

      {/* Anniversay */}
      <PersPrefAnniversary
        marital_status={t(info.marital_status)}
        anniversary_day={info.anniversary_day}
        anniversary_month={info.anniversary_month}
        anniversary_year={info.anniversary_year}
      />

      {/* Social Media */}
      <PersPrefSocials
        facebook_accounts={info.facebook_accounts}
        twitter_accounts={info.twitter_accounts}
        linkedin_accounts={info.linkedin_accounts}
        websites={info.websites}
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
