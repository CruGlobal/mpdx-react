import React, { useState } from 'react';
import { Edit } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Skeleton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Theme, styled, useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { CollapsibleEmailList } from 'src/components/Coaching/CoachingDetail/CollapsibleEmailList';
import { CollapsiblePhoneList } from 'src/components/Coaching/CoachingDetail/CollapsiblePhoneList';
import {
  Person,
  PersonModal,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonModal';
import { Facebook } from 'src/components/common/Links/Facebook';
import { LinkedIn } from 'src/components/common/Links/LinkedIn';
import { Twitter } from 'src/components/common/Links/Twitter';
import { Website } from 'src/components/common/Links/Website';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat, dayMonthFormat } from 'src/lib/intlFormat/intlFormat';

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
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'center',

  [theme.breakpoints.up('sm')]: {
    justifyContent: 'flex-start',
  },
}));

interface ProfileInfoProps {
  user: Person;
  accountListId: string;
  loading?: boolean;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  accountListId,
  user,
  loading,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const theme = useTheme<Theme>();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  const birthDate =
    user.birthdayYear && user.birthdayMonth && user.birthdayDay
      ? new Date(
          `${user.birthdayYear}-${user.birthdayMonth - 1}-${user.birthdayDay}`,
        )
      : null;

  return (
    <ProfileInfoWrapper component="section">
      {loading && <Skeleton variant="rectangular" height={188} />}
      {!loading && (
        <>
          <Box marginBottom={isMobile ? theme.spacing(2) : 0}>
            {/* Avatar */}
            <StyledAvatar
              src={user.avatar}
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

          {user.maritalStatus && (
            <Box>
              {user.maritalStatus}
              {' : '}
              {dayMonthFormat(
                user?.anniversaryDay || 0,
                user?.anniversaryMonth || 0,
                locale,
              )}
            </Box>
          )}

          {birthDate && (
            <Box>
              <Typography component="span">
                {t('Birthday')}
                {': '}
                {dateFormat(DateTime.fromISO(birthDate.toISOString()), locale)}
              </Typography>
            </Box>
          )}

          {user?.phoneNumbers && (
            <ContactPersonRowContainer>
              <CollapsiblePhoneList phones={user.phoneNumbers.nodes} />
            </ContactPersonRowContainer>
          )}

          {user?.emailAddresses && (
            <ContactPersonRowContainer>
              <CollapsibleEmailList emails={user.emailAddresses.nodes} />
            </ContactPersonRowContainer>
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
              contactId=""
              person={user}
            />
          ) : null}
        </>
      )}
    </ProfileInfoWrapper>
  );
};
