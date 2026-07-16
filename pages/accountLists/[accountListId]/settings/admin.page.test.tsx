import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
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
    mockSession({ admin: true });

    const { getAllByText } = render(<Components />);
    await waitFor(() => {
      expect(getAllByText('Impersonate User')).toHaveLength(3);
      expect(getAllByText('Reset Account').length).toEqual(1);
    });
  });

  it('should open impersonate user accordion', async () => {
    mockSession({ admin: true });

    const { getAllByText } = render(
      <Components selectedTab={AdminAccordion.ResetAccount} />,
    );
    await waitFor(() => {
      expect(getAllByText('Impersonate User').length).toEqual(1);
      expect(getAllByText('Reset Account').length).toEqual(3);
    });
  });

  it('should hide the reset account accordion from MPD supervisor admins who are not admins', async () => {
    mockSession({ admin: false, mpdSupervisorAdmin: true });

    const { findAllByText, queryByText } = render(<Components />);

    expect(await findAllByText('Impersonate User')).toHaveLength(3);
    expect(queryByText('Reset Account')).not.toBeInTheDocument();
  });
});
