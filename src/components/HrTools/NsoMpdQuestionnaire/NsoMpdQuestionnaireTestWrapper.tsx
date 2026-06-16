import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
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
        <GqlMockedProvider<{
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
        }>
          mocks={{
            GoalCalculatorConstants: {
              constant: {
                mpdGoalGeographicConstants: [
                  { location: 'Atlanta, GA' },
                  { location: 'Miami, FL' },
                  { location: 'None' },
                ],
              },
            },
          }}
        >
          <NsoMpdQuestionnaireProvider>{children}</NsoMpdQuestionnaireProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);
