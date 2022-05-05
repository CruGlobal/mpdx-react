import React, { ReactElement, ReactNode, useState } from 'react';
import { Hidden, styled } from '@material-ui/core';
import TopBar from './TopBar/TopBar';
import BottomBar from './BottomBar';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { NavBar } from 'src/components/Layouts/Primary/NavBar/NavBar';

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
  paddingTop: 60,
}));

interface Props {
  children: ReactNode;
  navBar?: ReactNode;
}

const Primary = ({ children, navBar }: Props): ReactElement => {
  const accountListId = useAccountListId();
  const [isMobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  return (
    <>
      <RootContainer>
        <TopBar
          onMobileNavOpen={() => setMobileNavOpen(true)}
          accountListId={accountListId}
        />
        {accountListId && (
          <NavBar
            onMobileClose={() => setMobileNavOpen(false)}
            openMobile={isMobileNavOpen}
          >
            {navBar}
          </NavBar>
        )}
        <Wrapper>
          <ContentContainer>
            <Content>{children}</Content>
          </ContentContainer>
        </Wrapper>
      </RootContainer>
      <Hidden mdUp>
        <BottomBar />
      </Hidden>
    </>
  );
};

export default Primary;
