import { render } from '@testing-library/react';
import TestWrapper from '__tests__/util/TestWrapper';
import { SpouseCapFirstAlert } from './SpouseCapFirstAlert';

const alertProps = {
  overName: 'John',
  otherName: 'Jane',
  otherCap: '$50,000.00',
  manuallySplitCap: false,
};

describe('SpouseCapFirstAlert', () => {
  it('asks to raise the other spouse up to their cap first', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SpouseCapFirstAlert {...alertProps} />
      </TestWrapper>,
    );

    const alert = getByTestId('SpouseCapFirstAlert');
    expect(alert).toHaveTextContent(
      "John's Gross Requested Salary exceeds their individual Maximum Allowable Salary",
    );
    expect(alert).toHaveTextContent(
      "raise Jane's Gross Requested Salary up to their Maximum Allowable Salary of $50,000.00",
    );
    expect(alert).not.toHaveTextContent('change how you split');
  });

  it('also suggests moving cap when the couple splits the combined cap by hand', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SpouseCapFirstAlert {...alertProps} manuallySplitCap />
      </TestWrapper>,
    );

    expect(getByTestId('SpouseCapFirstAlert')).toHaveTextContent(
      'change how you split your Combined Maximum Allowable Salary',
    );
  });
});
