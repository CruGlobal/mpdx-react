import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AdminAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
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
        <SnackbarProvider>
          <Admin />
        </SnackbarProvider>
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
