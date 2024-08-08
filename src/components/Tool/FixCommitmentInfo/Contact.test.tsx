import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import {
  fireEvent,
  render,
  waitFor,
} from '__tests__/util/testingLibraryReactMock';
import theme from '../../../theme';
import Contact from './Contact';

let testData = {
  id: 'test 1',
  name: 'Tester 1',
  avatar: '',
  statusTitle: 'Partner - Financial',
  statusValue: 'NEW_CONNECTION',
  frequencyTitle: 'Monthly',
  frequencyValue: 'monthly',
  amount: 50,
  amountCurrency: 'ARM',
  donations: {
    nodes: [
      {
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

let statuses = [{ name: '', value: '' }];

const router = {
  push: jest.fn(),
};

const setContactFocus = jest.fn();
const handleShowModal = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestWrapper>
      <Contact
        id={testData.id}
        name={testData.name}
        donations={testData.donations.nodes}
        key={testData.name}
        showModal={handleShowModal}
        statusTitle={testData.statusTitle}
        statusValue={testData.statusValue}
        amount={testData.amount}
        amountCurrency={testData.amountCurrency}
        frequencyTitle={testData.frequencyTitle}
        frequencyValue={testData.frequencyValue}
        statuses={statuses}
        setContactFocus={setContactFocus}
        avatar={testData.avatar}
      />
    </TestWrapper>
  </ThemeProvider>
);

describe('FixCommitmentContact', () => {
  beforeEach(() => {
    handleShowModal.mockClear();
    setContactFocus.mockClear();
  });

  it('default', () => {
    const { getByText, getByTestId } = render(<TestComponent />);
    expect(getByText(testData.name)).toBeInTheDocument();
    expect(
      getByText('Current: Partner - Financial ARM 50 Monthly'),
    ).toBeInTheDocument();
    expect(getByTestId('pledgeCurrency-input')).toBeInTheDocument();
  });

  it('should call hide and update functions', async () => {
    const { getByTestId } = render(<TestComponent />);
    userEvent.click(getByTestId('doNotChangeButton'));
    expect(handleShowModal).toHaveBeenCalledTimes(1);
    userEvent.click(getByTestId('hideButton'));
    expect(handleShowModal).toHaveBeenCalledTimes(2);
  });

  it('should redirect the page', () => {
    const { getByTestId } = render(
      <TestRouter router={router}>
        <TestComponent />
      </TestRouter>,
    );

    userEvent.click(getByTestId('contactSelect'));
    expect(setContactFocus).toHaveBeenCalledWith(testData.id, 'Donations');
  });

  it('should fail validation', async () => {
    testData = {
      id: 'test 2',
      name: 'Tester 2',
      avatar: '',
      statusTitle: '',
      statusValue: '',
      frequencyTitle: '',
      frequencyValue: '',
      amount: null!,
      amountCurrency: '',
      donations: {
        nodes: [
          {
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

    const { getByTestId } = render(<TestComponent />);
    userEvent.click(getByTestId('confirmButton'));
    await waitFor(() => {
      expect(getByTestId('statusSelectError')).toHaveTextContent(
        'Please select a status',
      );
    });
  });

  it('should should render select field options and inputs', async () => {
    statuses = [
      { name: 'Partner - Financial', value: 'PARTNER_FINANCIAL' },
      { name: 'test_option_1', value: 'test1' },
    ];
    const { getByTestId } = render(<TestComponent />);

    const frequency = getByTestId('pledgeFrequency-input');
    fireEvent.change(frequency, {
      target: { value: 'WEEKLY' },
    });
    expect(frequency).toHaveValue('WEEKLY');

    const currency = getByTestId('pledgeCurrency-input');
    fireEvent.change(currency, {
      target: { value: 'Currency' },
    });
    expect(currency).toHaveValue('Currency');

    const status = getByTestId('pledgeStatus-input');
    fireEvent.change(status, {
      target: { value: 'test1' },
    });
    expect(status).toHaveValue('test1');

    const amount = getByTestId('pledgeAmount-input');
    fireEvent.change(amount, {
      target: { value: '2.00' },
    });
    expect(amount).toHaveValue(2);
  });

  it('should render with correct styles', async () => {
    const { getByTestId } = render(
      <TestRouter router={router}>
        <TestComponent />
      </TestRouter>,
    );
    await waitFor(() => {
      const boxBottom = getByTestId('BoxBottom');
      expect(boxBottom.className).toEqual(expect.stringContaining('boxBottom'));
      expect(boxBottom).toHaveStyle('margin-left: 8px');
    });
  });
  it('should render donation data', async () => {
    const { getByTestId } = render(
      <TestRouter router={router}>
        <TestComponent />
      </TestRouter>,
    );
    const donationDate = getByTestId('donationDate');
    expect(donationDate).toHaveTextContent('12/24/2021');
    const donationAmount = getByTestId('donationAmount');
    expect(donationAmount).toHaveTextContent('0 UGX');
  });
});
