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
import { useTranslation } from 'react-i18next';
import { dateFromParts } from 'pages/accountLists/[accountListId]/contacts/helpers';
import { PersonModal } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/People/Items/PersonModal/PersonModal';
import { useGetProfileInfoQuery } from 'src/components/Settings/preferences/GetProfileInfo.generated';
import { CollapsibleEmailList } from 'src/components/Shared/CollapsibleContactInfo/CollapsibleEmailList';
import { CollapsiblePhoneList } from 'src/components/Shared/CollapsibleContactInfo/CollapsiblePhoneList';
import { Facebook } from 'src/components/common/Links/Facebook';
import { LinkedIn } from 'src/components/common/Links/LinkedIn';
import { Twitter } from 'src/components/common/Links/Twitter';
import { Website } from 'src/components/common/Links/Website';

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
  accountListId: string;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ accountListId }) => {
  const { data: profileInfoData, loading: profileInfoLoading } =
    useGetProfileInfoQuery();
  const { t } = useTranslation();
  const loading = profileInfoLoading;
  const user = profileInfoData?.user;
  const theme = useTheme<Theme>();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  const birthDate =
    user?.birthdayYear && user?.birthdayMonth && user?.birthdayDay
      ? dateFromParts(user.birthdayYear, user.birthdayMonth, user.birthdayDay)
      : null;

  const anniversary =
    user?.anniversaryMonth && user?.anniversaryDay
      ? dateFromParts(
          user?.anniversaryYear,
          user?.anniversaryMonth,
          user?.anniversaryDay,
        )
      : null;

  return (
    <ProfileInfoWrapper component="section">
      {loading && <Skeleton variant="rectangular" height={188} />}
      {!loading && user && (
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
              {anniversary && ' : ' + anniversary}
            </Box>
          )}

          {birthDate && (
            <Box>
              <Typography component="span">
                {t('Birthday')}
                {': '}
                {birthDate}
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
