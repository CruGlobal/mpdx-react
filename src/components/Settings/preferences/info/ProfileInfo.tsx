import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { Avatar, Box, Button, Typography, useMediaQuery } from '@mui/material';
import { Theme, styled, useTheme } from '@mui/material/styles';
import { profile2 } from '../DemoContent';
import { PersonModal } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonModal';
import { Edit } from '@mui/icons-material';
import { dateFormat, dayMonthFormat } from 'src/lib/intlFormat/intlFormat';
import { ProfileInfoData } from './ProfileInfoData';
import { Facebook } from 'src/components/common/Links/Facebook';
import { Twitter } from 'src/components/common/Links/Twitter';
import { LinkedIn } from 'src/components/common/Links/LinkedIn';
import { Website } from 'src/components/common/Links/Website';
import { useLocale } from 'src/hooks/useLocale';

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
  const locale = useLocale();
  const profile = profile2;
  const theme = useTheme<Theme>();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const user = data?.user || {};

  const birthDate = new Date(
    `${user.birthdayYear}-${user.birthdayMonth - 1}-${user.birthdayDay}`,
  );

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

      {user?.primaryEmailAddress && (
        <ProfileInfoData
          primaryData={user.primaryEmailAddress}
          additionalData={user.emailAddresses?.nodes}
        />
      )}

      {user?.primaryPhoneNumber && (
        <ProfileInfoData
          primaryData={user.primaryPhoneNumber}
          additionalData={user.phoneNumbers?.nodes}
        />
      )}

      {user.maritalStatus && (
        <Box>
          {user.maritalStatus}
          {' : '}
          {dayMonthFormat(user.anniversaryDay, user.anniversaryMonth, locale)}
        </Box>
      )}

      <Box>
        {user.facebookAccounts?.nodes?.map((account) => (
          <Facebook account={account} key={account.id} />
        ))}
        {user.twitterAccounts?.nodes?.map((account) => (
          <Twitter account={account} key={account.id} />
        ))}
        {user.linkedinAccounts?.nodes?.map((account) => (
          <LinkedIn account={account} key={account.id} />
        ))}
        {user.websites?.nodes?.map((account) => (
          <Website account={account} key={account.id} />
        ))}
      </Box>

      {birthDate && (
        <Box>
          <Typography component="span">
            {t('Birthday')}
            {': '}
            {dateFormat(DateTime.fromISO(birthDate.toISOString()), locale)}
          </Typography>
        </Box>
      )}

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
