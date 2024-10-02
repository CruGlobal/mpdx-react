import React, { ReactElement } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Avatar, Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAccountIcon = styled(AccountCircleIcon)(({ theme }) => ({
  textTransform: 'none',
  color: theme.palette.common.white,
  opacity: '0.75',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    opacity: '1',
  },
}));

const ImpersonatingBox = styled(Box)(() => ({
  paddingLeft: '6px',
  paddingRight: '6px',
}));
const ImpersonatingAvatar = styled(AccountCircleIcon)(() => ({
  color: '#ffffff',
}));

const ImpersonatingIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'showSubAccount',
})<{ showSubAccount?: boolean }>(({ showSubAccount }) => ({
  backgroundColor: '#f6921e',
  paddingTop: showSubAccount ? '10px' : '20px',
  paddingBottom: showSubAccount ? '10px' : '20px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#d87809',
  },
}));

interface ProfileNameProps {
  impersonating: boolean;
  showSubAccount: boolean;
  onProfileMenuOpen: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  children: React.ReactNode;
  avatar?: string;
  loading?: boolean;
}

const ProfileName = ({
  impersonating,
  showSubAccount,
  onProfileMenuOpen,
  avatar,
  loading,
  children,
}: ProfileNameProps): ReactElement => {
  return (
    <>
      {impersonating && (
        <ImpersonatingIconButton
          onClick={onProfileMenuOpen}
          data-testid="profileMenuButton"
          showSubAccount={showSubAccount}
        >
          <ImpersonatingBox display="flex" alignItems="center" m={-1}>
            <ImpersonatingAvatar />
            {children}
          </ImpersonatingBox>
        </ImpersonatingIconButton>
      )}
      {!impersonating && (
        <IconButton onClick={onProfileMenuOpen} data-testid="profileMenuButton">
          <Box display="flex" alignItems="center" m={-1}>
            <IconButton>
              {loading || !avatar ? (
                <StyledAccountIcon data-testid="AccountIconInTopBar" />
              ) : (
                <Avatar
                  data-testid="AvatarInTopBar"
                  src={avatar}
                  sx={{
                    width: 30,
                    height: 30,
                  }}
                />
              )}
            </IconButton>
            {children}
          </Box>
        </IconButton>
      )}
    </>
  );
};

export default ProfileName;
