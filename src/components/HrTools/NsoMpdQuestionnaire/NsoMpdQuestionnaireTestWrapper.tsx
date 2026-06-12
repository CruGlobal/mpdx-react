import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
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
      <SnackbarProvider>
        <NsoMpdQuestionnaireProvider>{children}</NsoMpdQuestionnaireProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);
