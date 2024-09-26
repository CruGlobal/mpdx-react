import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { fireEvent, render } from '__tests__/util/testingLibraryReactMock';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { TabKey } from 'src/components/Contacts/ContactDetails/ContactDetails';
import { PledgeFrequencyEnum, StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../theme';
import Contact from './Contact';

let testData = {
  id: 'test 1',
  name: 'Tester 1',
  avatar: '',
  status: 'PARTNER_FINANCIAL',
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

const router = {
  push: jest.fn(),
};

const setContactFocus = jest.fn();
const handleShowModal = jest.fn();

const TestComponent = ({ status = testData.status }: { status?: string }) => (
  <ThemeProvider theme={theme}>
    <TestWrapper>
      <GqlMockedProvider<{
        LoadConstants: LoadConstantsQuery;
      }>
        mocks={{
          LoadConstants: loadConstantsMockData,
        }}
      >
        <Contact
          id={testData.id}
          name={testData.name}
          donations={testData.donations.nodes}
          key={testData.name}
          showModal={handleShowModal}
          status={status}
          amount={testData.amount}
          amountCurrency={testData.amountCurrency}
          frequencyValue={testData.frequencyValue}
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

  it('should should render select field options and inputs', async () => {
    const { getByTestId, findByTestId } = render(<TestComponent />);

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
    expect(status).toHaveValue(StatusEnum.PartnerFinancial);

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

    const boxBottom = getByTestId('BoxBottom');
    expect(boxBottom.className).toEqual(expect.stringContaining('boxBottom'));
    expect(boxBottom).toHaveStyle('margin-left: 8px');
  });

  it('should render donation data', async () => {
    const { getByTestId, getByText } = render(
      <TestRouter router={router}>
        <TestComponent status="" />
      </TestRouter>,
    );
    expect(getByText('Current: ARM 50 Monthly')).toBeInTheDocument();
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
      status: '',
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

    const { findByTestId } = render(
      <TestRouter router={router}>
        <TestComponent />
      </TestRouter>,
    );
    expect(await findByTestId('pledgeFrequency-input')).toHaveValue('');
  });

  it('changes pledgeCurrencies', async () => {
    const { findByTestId, getByRole, findByRole } = render(
      <TestRouter router={router}>
        <TestComponent />
      </TestRouter>,
    );
    expect(await findByTestId('pledgeCurrency-input')).toBeInTheDocument();
    const CurrencyField = getByRole('combobox', { name: 'Currency' });
    userEvent.click(CurrencyField);
    userEvent.click(await findByRole('option', { name: 'CDF (CDF)' })),
      expect(CurrencyField).toHaveTextContent('CDF (CDF)');
  });
});
