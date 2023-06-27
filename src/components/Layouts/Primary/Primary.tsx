import React, { ReactElement, ReactNode, useState } from 'react';
import { styled } from '@mui/material/styles';
import TopBar from './TopBar/TopBar';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { NavBar } from 'src/components/Layouts/Primary/NavBar/NavBar';

export const navBarHeight = '64px';

const RootContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
  width: '100%',
}));

const ContentContainer = styled('div')(() => ({
  display: 'flex',
  flex: '1 1 auto',
  overflow: 'hidden',
}));

const Content = styled('div')(() => ({
  flex: '1 1 auto',
  height: '100%',
  overflow: 'auto',
}));

const Wrapper = styled('div')(() => ({
  display: 'flex',
  flex: '1 1 auto',
  overflow: 'hidden',
  paddingTop: navBarHeight,
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
        onMobileNavOpen={() => setMobileNavOpen(true)}
        accountListId={accountListId}
      />
      {accountListId && (
        <NavBar
          onMobileClose={() => setMobileNavOpen(false)}
          openMobile={isMobileNavOpen}
        />
      )}
      <Wrapper>
        <ContentContainer>
          <Content>{children}</Content>
        </ContentContainer>
      </Wrapper>
    </RootContainer>
  );
};

export default Primary;
