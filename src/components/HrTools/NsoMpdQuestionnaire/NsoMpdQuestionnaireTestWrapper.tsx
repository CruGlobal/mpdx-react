import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { NsoMpdQuestionnaireProvider } from './Shared/NsoMpdQuestionnaireContext';

interface NsoMpdQuestionnaireTestWrapperProps {
  children?: React.ReactNode;
}

export const NsoMpdQuestionnaireTestWrapper: React.FC<
  NsoMpdQuestionnaireTestWrapperProps
> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <SnackbarProvider>
          <NsoMpdQuestionnaireProvider>{children}</NsoMpdQuestionnaireProvider>
        </SnackbarProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);
