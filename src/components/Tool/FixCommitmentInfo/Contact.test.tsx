import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../theme';
import Contact from './Contact';

const testData = {
  id: 'test123',
  name: 'Test test',
  statusTitle: 'Partner - Financial',
  statusValue: 'partner-financial',
  frequencyTitle: 'Monthly',
  frequencyValue: 'monthly',
  amount: 50,
  amountCurrency: 'CAD',
};

const router = {
  push: jest.fn(),
};

describe('FixCommitmentContact', () => {
  it('default', () => {
    const hideFunction = jest.fn();
    const updateFunction = jest.fn();
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Contact
            id={testData.id}
            name={testData.name}
            key={testData.name}
            statusTitle={testData.statusTitle}
            statusValue={testData.statusValue}
            amount={testData.amount}
            amountCurrency={testData.amountCurrency}
            frequencyTitle={testData.frequencyTitle}
            frequencyValue={testData.frequencyValue}
            hideFunction={hideFunction}
            updateFunction={updateFunction}
            statuses={[]}
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByText(testData.name)).toBeInTheDocument();
    expect(
      getByText(
        `Current: ${testData.statusTitle} ${testData.amount.toFixed(2)} ${
          testData.amountCurrency
        } ${testData.frequencyTitle}`,
      ),
    ).toBeInTheDocument();
  });

  it('should call hide and update functions', () => {
    const hideFunction = jest.fn();
    const updateFunction = jest.fn();
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Contact
            id={testData.id}
            name={testData.name}
            key={testData.name}
            statusTitle={testData.statusTitle}
            statusValue={testData.statusValue}
            amount={testData.amount}
            amountCurrency={testData.amountCurrency}
            frequencyTitle={testData.frequencyTitle}
            frequencyValue={testData.frequencyValue}
            hideFunction={hideFunction}
            updateFunction={updateFunction}
            statuses={[]}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    userEvent.click(getByTestId('confirmButton'));

    expect(updateFunction).toHaveBeenCalledTimes(1);

    userEvent.click(getByTestId('doNotChangeButton'));

    expect(updateFunction).toHaveBeenCalledTimes(2);

    userEvent.click(getByTestId('hideButton'));

    expect(hideFunction).toHaveBeenCalledTimes(1);
  });

  it('should redirect the page', () => {
    const hideFunction = jest.fn();
    const updateFunction = jest.fn();

    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <Contact
            id={testData.id}
            name={testData.name}
            key={testData.name}
            statusTitle={testData.statusTitle}
            statusValue={testData.statusValue}
            amount={testData.amount}
            amountCurrency={testData.amountCurrency}
            frequencyTitle={testData.frequencyTitle}
            frequencyValue={testData.frequencyValue}
            hideFunction={hideFunction}
            updateFunction={updateFunction}
            statuses={[]}
          />
        </TestRouter>
      </ThemeProvider>,
    );
    userEvent.click(getByTestId('goToContactsButton'));

    expect(router.push).toHaveBeenCalled();
  });

  it('should render statuses', () => {
    const hideFunction = jest.fn();
    const updateFunction = jest.fn();

    const { getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <Contact
            id={testData.id}
            name={testData.name}
            key={testData.name}
            statusTitle={'testData.statusTitle'}
            statusValue={testData.statusValue}
            amount={testData.amount}
            amountCurrency={testData.amountCurrency}
            frequencyTitle={testData.frequencyTitle}
            frequencyValue={testData.frequencyValue}
            hideFunction={hideFunction}
            updateFunction={updateFunction}
            statuses={[
              { name: 'Partner - Financial', value: 'PARTNER_FINANCIAL' },
              { name: 'test_option_1', value: 'test1' },
            ]}
          />
        </TestRouter>
      </ThemeProvider>,
    );
    expect(getByText(testData.statusTitle)).toBeInTheDocument();
    userEvent.click(getByTestId('statusSelect'));
    expect(getByText('test_option_1')).toBeInTheDocument();
  });
});
