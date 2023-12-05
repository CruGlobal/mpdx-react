import React, { ReactElement } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAvatar = styled(AccountCircleIcon)(({ theme }) => ({
  color: theme.palette.cruGrayMedium.main,
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
}

const ProfileName = ({
  impersonating,
  showSubAccount,
  onProfileMenuOpen,
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
            <StyledAvatar />
            {children}
          </Box>
        </IconButton>
      )}
    </>
  );
};

export default ProfileName;
