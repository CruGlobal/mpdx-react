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
import { Theme, styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { PersonModal } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonModal';
import { useGetProfileInfoQuery } from 'src/components/Settings/preferences/GetProfileInfo.generated';
import { CollapsibleEmailList } from 'src/components/Shared/CollapsibleContactInfo/CollapsibleEmailList';
import { CollapsiblePhoneList } from 'src/components/Shared/CollapsibleContactInfo/CollapsiblePhoneList';
import { Facebook } from 'src/components/common/Links/Facebook';
import { LinkedIn } from 'src/components/common/Links/LinkedIn';
import { Twitter } from 'src/components/common/Links/Twitter';
import { Website } from 'src/components/common/Links/Website';
import { useLocale } from 'src/hooks/useLocale';
import { dateFromParts } from 'src/lib/intlFormat/intlFormat';
import theme from 'src/theme';

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
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  [theme.breakpoints.up('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
}));

interface ProfileInfoProps {
  accountListId: string;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ accountListId }) => {
  const { data: profileInfoData, loading } = useGetProfileInfoQuery();
  const { t } = useTranslation();
  const user = profileInfoData?.user;
  const locale = useLocale();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  const birthDate =
    user?.birthdayYear && user?.birthdayMonth && user?.birthdayDay
      ? dateFromParts(
          user.birthdayYear,
          user.birthdayMonth,
          user.birthdayDay,
          locale,
        )
      : null;

  const anniversary =
    user?.anniversaryMonth && user?.anniversaryDay
      ? dateFromParts(
          user?.anniversaryYear,
          user?.anniversaryMonth,
          user?.anniversaryDay,
          locale,
        )
      : null;

  const occupationAndEmployer =
    (user?.occupation || user?.employer) &&
    user?.occupation +
      (user?.occupation && user?.employer ? ' - ' : '') +
      user?.employer;

  return (
    <ProfileInfoWrapper component="section">
      {loading && (
        <>
          <Skeleton
            variant="circular"
            height={theme.spacing(12)}
            width={theme.spacing(12)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
          <Skeleton variant="rectangular" height={188} />
        </>
      )}
      {!loading && user && (
        <>
          <Box sx={{ marginBottom: isMobile ? 2 : 0 }}>
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
            {occupationAndEmployer && (
              <Typography component="h4">{occupationAndEmployer}</Typography>
            )}
          </Box>

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

          {user.maritalStatus && (
            <Box>
              {user.maritalStatus}
              {anniversary && ' : ' + anniversary}
            </Box>
          )}

          {birthDate && (
            <Box>
              <Typography component="span">
                {`${t('Birthday')}: ${birthDate}`}
              </Typography>
            </Box>
          )}

          <Box>
            {user.facebookAccounts?.nodes?.map((account) => (
              <Facebook username={account.username} key={account.id} />
            ))}
            {user.twitterAccounts?.nodes?.map((account) => (
              <Twitter screenName={account.screenName} key={account.id} />
            ))}
            {user.linkedinAccounts?.nodes?.map((account) => (
              <LinkedIn publicUrl={account.publicUrl} key={account.id} />
            ))}
            {user.websites?.nodes?.map((account) => (
              <Website url={account.url} key={account.id} />
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
              contactId="" //contactId is a required prop
              person={user}
            />
          ) : null}
        </>
      )}
    </ProfileInfoWrapper>
  );
};
