import React, { ReactElement, ReactNode, useState } from 'react';
import { styled } from '@mui/material/styles';
import { NavBar } from 'src/components/Layouts/Primary/NavBar/NavBar';
import { useAccountListId } from 'src/hooks/useAccountListId';
import TopBar from './TopBar/TopBar';

export const navBarHeight = '64px';

const RootContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  width: '100vw',
  height: '100vh',
  overflow: 'scroll',
}));

const ContentContainer = styled('div')(() => ({
  display: 'flex',
}));

const Content = styled('div')(() => ({
  flex: '1 1 auto',
  height: '100%',
}));

interface Props {
  children: ReactNode;
}

const Primary = ({ children }: Props): ReactElement => {
  const accountListId = useAccountListId();
  const [isMobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  return (
    <RootContainer>
      <TopBar
        onMobileNavOpen={() => setMobileNavOpen(!isMobileNavOpen)}
        accountListId={accountListId}
      />
      {accountListId && (
        <NavBar
          onMobileClose={() => setMobileNavOpen(false)}
          openMobile={isMobileNavOpen}
        />
      )}
      <ContentContainer>
        <Content>{children}</Content>
      </ContentContainer>
    </RootContainer>
  );
};

export default Primary;
