import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { enforceAdminConsole } from 'pages/api/utils/pagePropsHelpers';
import { AdminAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { ImpersonatorRole } from 'src/lib/impersonationAccess';
import theme from 'src/theme';
import Admin, { getServerSideProps } from './admin.page';

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
  beforeEach(() => {
    mockSession({ admin: true });
  });

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

  describe('role holders', () => {
    it('shows only the impersonate user accordion to a non-admin role holder', async () => {
      mockSession({
        admin: false,
        impersonationRole: ImpersonatorRole.MpdLeader,
      });
      const { findAllByText, queryByText } = render(<Components />);

      expect(await findAllByText('Impersonate User')).toHaveLength(3);
      expect(queryByText('Reset Account')).not.toBeInTheDocument();
    });

    it('shows both accordions to an admin', async () => {
      mockSession({
        admin: true,
        impersonationRole: ImpersonatorRole.MpdLeader,
      });
      const { findAllByText, getAllByText } = render(<Components />);

      expect(await findAllByText('Impersonate User')).toHaveLength(3);
      expect(getAllByText('Reset Account')).toHaveLength(1);
    });
  });
});

describe('getServerSideProps', () => {
  it('replaces the impersonate form with a notice while already impersonating', async () => {
    mockSession({
      admin: true,
      impersonating: true,
      impersonatorRole: ImpersonatorRole.Developer,
    });
    const { queryByText, findByText } = render(<Components />);

    expect(
      await findByText(
        'Stop impersonating before starting another impersonation.',
      ),
    ).toBeInTheDocument();
    expect(queryByText('Impersonate User')).not.toBeInTheDocument();
  });

  it('uses enforceAdminConsole', () => {
    expect(getServerSideProps).toBe(enforceAdminConsole);
  });
});
