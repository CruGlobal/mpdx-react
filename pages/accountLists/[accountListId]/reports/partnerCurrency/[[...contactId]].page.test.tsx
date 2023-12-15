import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import PartnerCurrencyReportPage from './[[...contactId]].page';

const push = jest.fn();

interface TestingComponentProps {
  routerContactId?: string;
}

const TestingComponent: React.FC<TestingComponentProps> = ({
  routerContactId,
}) => {
  const router = {
    query: {
      accountListId: 'account-list-1',
      contactId: routerContactId ? [routerContactId] : undefined,
    },
    isReady: true,
    push,
  };

  const mocks = {
    FourteenMonthReport: {
      fourteenMonthReport: {
        currencyGroups: [
          {
            contacts: [
              {
                id: 'contact-1',
                name: 'John Doe',
                lastDonationCurrency: 'USD',
                pledgeCurrency: 'USD',
              },
            ],
          },
        ],
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider mocks={mocks}>
          <SnackbarProvider>
            <PartnerCurrencyReportPage />
          </SnackbarProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('partnerCurrency page', () => {
  it('renders', () => {
    const { getByRole } = render(<TestingComponent />);

    expect(
      getByRole('heading', { name: 'Contributions by Partner Currency' }),
    ).toBeInTheDocument();
  });

  it('renders contact panel', () => {
    const { getByRole } = render(
      <TestingComponent routerContactId={'contact-1'} />,
    );

    expect(getByRole('tab', { name: 'Tasks' })).toBeInTheDocument();
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
    const { findByText } = render(<TestingComponent />);

    userEvent.click(await findByText('John Doe'));

    expect(push).toHaveBeenCalledWith(
      '/accountLists/account-list-1/reports/partnerCurrency/contact-1',
    );
  });

  it('closes contact panel', async () => {
    const { getByTestId } = render(
      <TestingComponent routerContactId={'contact-1'} />,
    );

    userEvent.click(getByTestId('ContactDetailsHeaderClose'));
    expect(push).toHaveBeenCalledWith(
      '/accountLists/account-list-1/reports/partnerCurrency/',
    );
  });
});
