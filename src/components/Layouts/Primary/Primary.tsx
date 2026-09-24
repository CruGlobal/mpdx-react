import React, { ReactElement, ReactNode, useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AssistantOrb } from 'src/components/Assistant/AssistantOrb';
import { NavBar } from 'src/components/Layouts/Primary/NavBar/NavBar';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
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

const Content = styled(Box)(() => ({
  flex: '1 1 auto',
  height: '100%',
  overflow: 'auto',
}));

interface Props {
  children: ReactNode;
}

const Primary = ({ children }: Props): ReactElement => {
  const accountListId = useOptionalAccountListId();
  const { onSetupTour } = useSetupContext();
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
      {accountListId && !onSetupTour && <AssistantOrb />}
    </RootContainer>
  );
};

export default Primary;
