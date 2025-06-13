import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { GetExpectedMonthlyTotalsQuery } from '../GetExpectedMonthlyTotals.generated';
import ExpectedMonthlyTotalReportPage from './[[...contactId]].page';

const push = jest.fn();

interface TestComponentProps {
  routerHasContactId?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  routerHasContactId = false,
}) => {
  const router = {
    query: {
      accountListId: 'account-list-1',
      contactId: routerHasContactId
        ? ['00000000-0000-0000-0000-000000000000']
        : undefined,
    },
    isReady: true,
    push,
  };

  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{
          GetExpectedMonthlyTotals: GetExpectedMonthlyTotalsQuery;
        }>
          mocks={{
            GetExpectedMonthlyTotals: {
              expectedMonthlyTotalReport: {
                likely: {
                  donations: [
                    { contactId: 'contact-1', contactName: 'John Doe' },
                  ],
                },
              },
            },
          }}
        >
          <SnackbarProvider>
            <ExpectedMonthlyTotalReportPage />
          </SnackbarProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('Expected Monthly Total Report page', () => {
  it('renders', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Expected Monthly Total' }),
    ).toBeInTheDocument();
  });

  it('renders contact panel', async () => {
    const { findByRole } = render(<TestComponent routerHasContactId />);

    expect(await findByRole('tab', { name: 'Tasks' })).toBeInTheDocument();
  });

  it('toggles navigation panel', async () => {
    const { findByTestId, getByRole, getByTestId } = render(<TestComponent />);

    const leftPanel = getByTestId('SidePanelsLayoutLeftPanel');

    userEvent.click(getByRole('button', { name: 'Toggle Navigation Panel' }));
    expect(leftPanel).toHaveStyle('transform: none');

    userEvent.click(await findByTestId('CloseIcon'));
    expect(leftPanel).toHaveStyle('transform: translate(-100%)');
  });

  it('changes the URL when a contact is selected', async () => {
    const { findByRole } = render(<TestComponent />);

    userEvent.click(
      await findByRole('button', { name: /^Likely Partners This Month/ }),
    );
    userEvent.click(await findByRole('link', { name: 'John Doe' }));
    expect(push).toHaveBeenCalled();
  });

  it('closes contact panel', async () => {
    const { findByTestId } = render(<TestComponent routerHasContactId />);

    userEvent.click(await findByTestId('ContactDetailsHeaderClose'));
    expect(push).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          accountListId: 'account-list-1',
          contactId: [],
        },
      }),
      undefined,
      { shallow: true },
    );
  });
});
