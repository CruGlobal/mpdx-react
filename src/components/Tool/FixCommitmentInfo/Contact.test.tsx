import React from 'react';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import Contact from './Contact';

const testData = {
  name: 'Test test',
  tagTitle: 'Partner - Financial',
  tagValue: 'partner-financial',
  frequencyTitle: 'Monthly',
  frequencyValue: 'monthly',
  amount: 50,
  amountCurrency: 'CAD',
};

describe('FixCommitmentContact', () => {
  it('default', () => {
    const { getByText } = render(
      <TestWrapper>
        <Contact
          name={testData.name}
          key={testData.name}
          tagTitle={testData.tagTitle}
          tagValue={testData.tagValue}
          amount={testData.amount}
          amountCurrency={testData.amountCurrency}
          frequencyTitle={testData.frequencyTitle}
          frequencyValue={testData.frequencyValue}
        />
      </TestWrapper>,
    );
    expect(getByText(testData.name)).toBeInTheDocument();
    expect(getByText(testData.tagTitle)).toBeInTheDocument();
    expect(getByText(testData.frequencyTitle)).toBeInTheDocument();
    expect(
      getByText(
        `Current: ${testData.tagTitle} ${testData.amount.toFixed(2)} ${
          testData.amountCurrency
        } ${testData.frequencyTitle}`,
      ),
    ).toBeInTheDocument();
  });
});
