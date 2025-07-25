import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { twelveMonthReportMock } from 'src/components/Reports/TwelveMonthReports/TwelveMonthReportMock';
import theme from 'src/theme';
import SalaryCurrencyReportPage from './[[...contactId]].page';

const push = jest.fn();

interface TestingComponentProps {
  routerHasContactId?: boolean;
}

const TestingComponent: React.FC<TestingComponentProps> = ({
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
      <GqlMockedProvider>
        <TestRouter router={router}>
          <SnackbarProvider>
            <SalaryCurrencyReportPage />
          </SnackbarProvider>
        </TestRouter>
      </GqlMockedProvider>
    </ThemeProvider>
  );
};

describe('salaryCurrency page', () => {
  fetchMock.enableMocks();
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponses([
      JSON.stringify(twelveMonthReportMock),
      { status: 200 },
    ]);
    process.env.REST_API_URL = 'https://api.stage.mpdx.org/api/v2/';
  });
  it('renders', () => {
    const { getByRole } = render(<TestingComponent />);

    expect(
      getByRole('heading', { name: 'Contributions by Salary Currency' }),
    ).toBeInTheDocument();
  });

  it('renders contact panel', async () => {
    const { findByRole } = render(<TestingComponent routerHasContactId />);

    expect(await findByRole('tab', { name: 'Tasks' })).toBeInTheDocument();
  });

  it('toggles filter panel', async () => {
    const { findByTestId, getByRole, getByTestId } = render(
      <TestingComponent />,
    );

    const leftPanel = getByTestId('SidePanelsLayoutLeftPanel');

    userEvent.click(getByRole('button', { name: 'Toggle Filter Panel' }));
    expect(leftPanel).toHaveStyle('transform: none');

    userEvent.click(await findByTestId('CloseIcon'));
    expect(leftPanel).toHaveStyle('transform: translate(-100%)');
  });

  it('changes the URL when a contact is selected', async () => {
    const { findByRole } = render(<TestingComponent />);

    expect(push).not.toHaveBeenCalled();

    userEvent.click(await findByRole('link', { name: 'John Doe' }));

    expect(push).toHaveBeenCalled();
  });

  it('closes contact panel', async () => {
    const { findByTestId } = render(<TestingComponent routerHasContactId />);

    userEvent.click(await findByTestId('ContactDetailsHeaderClose'));
    expect(push).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          accountListId: 'account-list-1',
        },
      }),
      undefined,
      { shallow: true },
    );
  });
});
