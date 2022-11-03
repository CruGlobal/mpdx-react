import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Edit } from '@mui/icons-material';
import { info } from '../DemoContent';
import { PersPrefModal } from '../modals/PersPrefModal';
import { PersPrefWork } from './PersPrefWork';
import { PersPrefContactMethods } from './PersPrefContactMethods';
import { PersPrefAnniversary } from './PersPrefAnniversary';
import { PersPrefSocials } from './PersPrefSocials';

const StyledBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    gap: theme.spacing(4),
  },
  [theme.breakpoints.up('md')]: {
    justifyContent: 'space-evenly',
    gap: theme.spacing(6),
  },
}));

const StyledContactTop = styled(Box)(() => ({
  textAlign: 'center',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: theme.spacing(2),
}));

const StyledContactEdit = styled(Button)(({ theme }) => ({
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
    <StyledBox component="section">
      <StyledContactTop>
        <StyledAvatar
          src={info.avatar}
          alt={`${info.first_name} ${info.last_name}`}
        />
        <Typography component="h3" variant="h5">
          {t(info.title)} {info.first_name} {info.last_name} {t(info.suffix)}
        </Typography>
        <PersPrefWork employer={info.employer} occupation={info.occupation} />
      </StyledContactTop>
      <Box>
        <PersPrefContactMethods type="email" methods={info.email} />
        <PersPrefContactMethods type="phone" methods={info.phone} />
        <PersPrefAnniversary
          marital_status={t(info.marital_status)}
          anniversary_day={info.anniversary_day}
          anniversary_month={info.anniversary_month}
          anniversary_year={info.anniversary_year}
        />
        <PersPrefSocials
          facebook_accounts={info.facebook_accounts}
          twitter_accounts={info.twitter_accounts}
          linkedin_accounts={info.linkedin_accounts}
          websites={info.websites}
        />
      </Box>
      <StyledContactEdit
        onClick={handleOpen}
        startIcon={<Edit />}
        disableRipple
      >
        {t('Edit')}
      </StyledContactEdit>
      {profileOpen ? (
        <PersPrefModal handleClose={() => setProfileOpen(false)} />
      ) : null}
    </StyledBox>
  );
};
