import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  fireEvent,
  render,
  waitFor,
} from '__tests__/util/testingLibraryReactMock';
import { TabKey } from 'src/components/Contacts/ContactDetails/ContactDetails';
import { PledgeFrequencyEnum } from 'src/graphql/types.generated';
import theme from '../../../theme';
import Contact from './Contact';

let testData = {
  id: 'test 1',
  name: 'Tester 1',
  avatar: '',
  statusTitle: 'Partner - Financial',
  statusValue: 'NEW_CONNECTION',
  frequencyTitle: 'Monthly',
  frequencyValue: PledgeFrequencyEnum.Monthly,
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

const router = {
  push: jest.fn(),
};

const setContactFocus = jest.fn();
const handleShowModal = jest.fn();

const TestComponent = ({
  statuses = ['Partner - Financial', 'test_option_1'],
}: {
  statuses?: string[];
}) => (
  <ThemeProvider theme={theme}>
    <TestWrapper>
      <GqlMockedProvider
        mocks={{
          LoadConstants: {
            constant: {
              pledgeCurrency: [
                {
                  code: 'CAD',
                  codeSymbolString: 'CAD ($)',
                  name: 'Canadian Dollar',
                },
                {
                  code: 'CDF',
                  codeSymbolString: 'CDF (CDF)',
                  name: 'Congolese Franc',
                },
                {
                  code: 'CHE',
                  codeSymbolString: 'CHE (CHE)',
                  name: 'WIR Euro',
                },
              ],
            },
          },
        }}
      >
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
          frequencyValue={testData.frequencyValue}
          statuses={statuses}
          setContactFocus={setContactFocus}
          avatar={testData.avatar}
        />
      </GqlMockedProvider>
    </TestWrapper>
  </ThemeProvider>
);

describe('FixCommitmentContact', () => {
  beforeEach(() => {
    handleShowModal.mockClear();
    setContactFocus.mockClear();
  });

  it('default', async () => {
    const { getByText, findByTestId } = render(<TestComponent />);
    expect(getByText(testData.name)).toBeInTheDocument();
    expect(
      getByText('Current: Partner - Financial ARM 50 Monthly'),
    ).toBeInTheDocument();
    expect(await findByTestId('pledgeCurrency-input')).toBeInTheDocument();
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
    expect(setContactFocus).toHaveBeenCalledWith(testData.id, TabKey.Donations);
  });

  it('should fail validation', async () => {
    testData = {
      id: 'test 2',
      name: 'Tester 2',
      avatar: '',
      statusTitle: '',
      statusValue: '',
      frequencyTitle: '',
      frequencyValue: PledgeFrequencyEnum.Annual,
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
    const { getByTestId, findByTestId } = render(
      <TestComponent statuses={['Partner - Financial', 'test_option_1']} />,
    );

    const frequency = getByTestId('pledgeFrequency-input');
    fireEvent.change(frequency, {
      target: { value: 'WEEKLY' },
    });
    expect(frequency).toHaveValue('WEEKLY');

    const currency = await findByTestId('pledgeCurrency-input');
    fireEvent.select(currency, {
      target: { value: 'USD ($)' },
    });
    expect(currency).toHaveValue('USD ($)');

    const status = getByTestId('pledgeStatus-input');
    fireEvent.change(status, {
      target: { value: 'Partner - Financial' },
    });
    expect(status).toHaveValue('Partner - Financial');

    const amount = getByTestId('pledgeAmount-input');
    fireEvent.change(amount, {
      target: { value: '2.00' },
    });
    expect(amount).toHaveValue(2);
  });

  it('should render with correct styles', async () => {
    const { getByTestId } = render(
      <TestRouter router={router}>
        <TestComponent statuses={['Partner - Financial', 'test_option_1']} />
      </TestRouter>,
    );

    const boxBottom = getByTestId('BoxBottom');
    expect(boxBottom.className).toEqual(expect.stringContaining('boxBottom'));
    expect(boxBottom).toHaveStyle('margin-left: 8px');
  });

  it('should render donation data', async () => {
    const { getByTestId } = render(
      <TestRouter router={router}>
        <TestComponent statuses={['Partner - Financial', 'test_option_1']} />
      </TestRouter>,
    );
    const donationDate = getByTestId('donationDate');
    expect(donationDate).toHaveTextContent('12/24/2021');
    const donationAmount = getByTestId('donationAmount');
    expect(donationAmount).toHaveTextContent('0 UGX');
  });
});
