import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { fireEvent, render } from '__tests__/util/testingLibraryReactMock';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { PledgeFrequencyEnum, StatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from '../../../theme';
import Contact from './Contact';

jest.mock('src/hooks/useAccountListId');
let testData = {
  id: 'tester-1',
  name: 'Tester 1',
  avatar: '',
  status: StatusEnum.PartnerFinancial,
  frequencyTitle: 'Monthly',
  frequencyValue: PledgeFrequencyEnum.Monthly,
  amount: 50,
  amountCurrency: 'ARM',
  donations: {
    nodes: [
      {
        id: 'donations-test-id-1',
        amount: {
          amount: 175,
          currency: 'USD',
          conversionDate: '2019-10-15',
          convertedCurrency: 'USD',
        },
      },
    ],
  },
};
const accountListId = 'accountListId';
const router = {
  pathname:
    '/accountLists/[accountListId]/tools/fix/commitmentInfo/[[...contactId]]',
  query: { accountListId: accountListId },
  push: jest.fn(),
};

const handleShowModal = jest.fn();

const TestComponent = ({
  status = testData.status,
}: {
  status?: StatusEnum | undefined;
}) => (
  <TestRouter router={router}>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider>
        <ContactPanelProvider>
          <Contact
            id={testData.id}
            name={testData.name}
            donations={testData.donations.nodes}
            key={testData.name}
            showModal={handleShowModal}
            currentStatus={status}
            amount={testData.amount}
            amountCurrency={testData.amountCurrency}
            frequencyValue={testData.frequencyValue}
            avatar={testData.avatar}
          />
        </ContactPanelProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('FixCommitmentContact', () => {
  beforeEach(() => {
    handleShowModal.mockClear();
    (useAccountListId as jest.Mock).mockReturnValue(accountListId);
  });

  it('default', async () => {
    const { getByText, getByRole } = render(<TestComponent />);
    expect(getByText(testData.name)).toBeInTheDocument();
    expect(getByText('Current: Partner - Financial')).toBeInTheDocument();
    expect(getByText('ARM 50 Monthly')).toBeInTheDocument();
    expect(getByRole('combobox', { name: 'Currency' })).toBeInTheDocument();
  });

  it('should call hide and update functions', async () => {
    const { getByTestId } = render(<TestComponent />);
    userEvent.click(getByTestId('doNotChangeButton'));
    expect(handleShowModal).toHaveBeenCalledTimes(1);
    userEvent.click(getByTestId('hideButton'));
    expect(handleShowModal).toHaveBeenCalledTimes(2);
  });

  it('should render contact link correctly', async () => {
    const { findByRole } = render(<TestComponent />);

    const contactName = await findByRole('heading', { name: 'Tester 1' });

    expect(contactName.parentElement).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/fix/commitmentInfo/tester-1?tab=Donations`,
    );
  });

  it('should should render select field options and inputs', async () => {
    const { getByTestId, getByRole } = render(<TestComponent />);

    const frequency = getByTestId('pledgeFrequency-input');
    fireEvent.change(frequency, {
      target: { value: 'WEEKLY' },
    });
    expect(frequency).toHaveValue('WEEKLY');

    const currency = getByRole('combobox', { name: 'Currency' });
    fireEvent.select(currency, {
      target: { value: 'USD ($)' },
    });
    expect(currency).toHaveValue('USD ($)');

    const status = getByTestId('pledgeStatus-input');
    fireEvent.change(status, {
      target: { value: 'Partner - Financial' },
    });
    expect(status).toHaveValue(StatusEnum.PartnerFinancial);

    const amount = getByTestId('pledgeAmount-input');
    fireEvent.change(amount, {
      target: { value: '2.00' },
    });
    expect(amount).toHaveValue(2);
  });

  it('should render with correct styles', async () => {
    const { getByTestId } = render(<TestComponent />);

    const boxBottom = getByTestId('BoxBottom');
    expect(boxBottom.className).toEqual(expect.stringContaining('boxBottom'));
    expect(boxBottom).toHaveStyle('margin-left: 8px');
  });

  it('should render donation data', async () => {
    const { getByTestId, getByText } = render(
      <TestComponent status={undefined} />,
    );
    expect(getByText('ARM 50 Monthly')).toBeInTheDocument();
    const donationDate = getByTestId('donationDate');
    expect(donationDate).toHaveTextContent('10/15/2019');
    const donationAmount = getByTestId('donationAmount');
    expect(donationAmount).toHaveTextContent('175 USD');
  });

  it('PledgeFrequency should be blank', async () => {
    testData = {
      id: 'test 2',
      name: 'Tester 2',
      avatar: '',
      status: StatusEnum.AskInFuture,
      frequencyTitle: '',
      frequencyValue: null!,
      amount: null!,
      amountCurrency: '',
      donations: {
        nodes: [
          {
            id: 'donations-test-id-1',
            amount: {
              amount: 0,
              currency: 'UGX',
              conversionDate: '2021-12-24',
              convertedCurrency: 'UGX',
            },
          },
        ],
      },
    };

    const { findByTestId } = render(<TestComponent />);
    expect(await findByTestId('pledgeFrequency-input')).toHaveValue('');
  });

  it('changes pledgeCurrencies', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);
    const CurrencyField = getByRole('combobox', { name: 'Currency' });
    expect(CurrencyField).toBeInTheDocument();
    userEvent.type(CurrencyField, 'usd');
    userEvent.click(await findByRole('option', { name: 'USD ($)' }));
    expect(CurrencyField).toHaveValue('USD ($)');
  });
});
