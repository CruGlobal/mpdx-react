import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  styled,
} from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { info } from '../DemoContent';
import { PersPrefModal } from '../modals/PersPrefModal';
import { PersPrefWork } from './PersPrefWork';
import { PersPrefContactMethods } from './PersPrefContactMethods';
import { PersPrefAnniversary } from './PersPrefAnniversary';
import { PersPrefSocials } from './PersPrefSocials';

const StyledContactTop = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    display: 'block',
    marginLeft: theme.spacing(8),
    marginBottom: theme.spacing(1),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
  marginRight: theme.spacing(2),
  display: 'inline-block',
  '& img': {
    display: 'block',
  },
  [theme.breakpoints.up('sm')]: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  [theme.breakpoints.up('md')]: {
    top: 32,
    left: 32,
  },
}));

const StyledContactBottom = styled(Box)(({ theme }) => ({
  '& ul': {
    marginTop: theme.spacing(1),
  },
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(8),
  },
}));

const StyledContactEdit = styled(Box)(({ theme }) => ({
  textAlign: 'right',
  marginTop: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    position: 'absolute',
    bottom: 16,
    right: 24,
  },
}));

export const PersPrefInfo: React.FC = () => {
  const { t } = useTranslation();

  const [profileOpen, setProfileOpen] = useState(false);

  const handleOpen = () => {
    setProfileOpen(true);
  };

  return (
    <Card style={{ position: 'relative' }}>
      <CardContent>
        <StyledContactTop>
          <StyledAvatar
            src={info.avatar}
            alt={`${info.first_name} ${info.last_name}`}
          />
          <Typography component="h3" variant="h5">
            {t(info.title)} {info.first_name} {info.last_name} {t(info.suffix)}
          </Typography>
        </StyledContactTop>
        <StyledContactBottom>
          <PersPrefWork employer={info.employer} occupation={info.occupation} />
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
        </StyledContactBottom>
        <StyledContactEdit>
          <Button onClick={handleOpen} startIcon={<Edit />} disableRipple>
            {t('Edit')}
          </Button>
          {profileOpen ? (
            <PersPrefModal handleClose={() => setProfileOpen(false)} />
          ) : null}
        </StyledContactEdit>
      </CardContent>
    </Card>
  );
};
