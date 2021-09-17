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
import { PersPrefWork } from './PersPrefWork';
import { PersPrefContacts } from './PersPrefContacts';
import { PersPrefAnniversary } from './PersPrefAnniversary';
import { PersPrefSocials } from './PersPrefSocials';
// import { PersPrefModal } from "./Modals/PersPrefModal";

const InfoCard = styled(Card)(() => ({
  position: 'relative',
}));

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

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return (
    <InfoCard>
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
          <PersPrefContacts contacts={info.email} />
          <PersPrefContacts contacts={info.phone} />
          <PersPrefAnniversary
            marital_status={t(info.marital_status)}
            anniversary_month={t(months[info.anniversary_month - 1])}
            anniversary_day={info.anniversary_day}
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
          {/* <PersPrefModal isOpen={profileOpen} handleOpen={setProfileOpen} /> */}
        </StyledContactEdit>
      </CardContent>
    </InfoCard>
  );
};
