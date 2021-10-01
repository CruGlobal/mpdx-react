import { ThemeProvider } from '@material-ui/styles';
import React from 'react';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
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
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByText(testData.name)).toBeInTheDocument();
    expect(getByText(testData.statusTitle)).toBeInTheDocument();
    expect(getByText(testData.frequencyTitle)).toBeInTheDocument();
    expect(
      getByText(
        `Current: ${testData.statusTitle} ${testData.amount.toFixed(2)} ${
          testData.amountCurrency
        } ${testData.frequencyTitle}`,
      ),
    ).toBeInTheDocument();
  });
});
