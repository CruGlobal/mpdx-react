import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AdminAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import Admin from './admin.page';

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: jest.fn(),
    };
  },
}));

interface ComponentsProps {
  selectedTab?: string;
}

const Components: React.FC<ComponentsProps> = ({ selectedTab }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={{ query: { selectedTab } }}>
      <GqlMockedProvider>
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>
            <Admin />
          </SnackbarProvider>
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('Admin', () => {
  it('should keep impersonate user accordion close', async () => {
    const { getAllByText } = render(<Components />);
    await waitFor(() => {
      expect(getAllByText('Impersonate User')).toHaveLength(3);
      expect(getAllByText('Reset Account').length).toEqual(1);
    });
  });

  it('should open impersonate user accordion', async () => {
    const { getAllByText } = render(
      <Components selectedTab={AdminAccordion.ResetAccount} />,
    );
    await waitFor(() => {
      expect(getAllByText('Impersonate User').length).toEqual(1);
      expect(getAllByText('Reset Account').length).toEqual(3);
    });
  });
});
