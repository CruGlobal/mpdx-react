import { render } from '@testing-library/react';
import { SpouseCapFirstAlert } from './SpouseCapFirstAlert';

const alertProps = {
  overName: 'John',
  otherName: 'Jane',
  otherCap: '$50,000.00',
  manuallySplitCap: false,
  otherCapRises: false,
};

describe('SpouseCapFirstAlert', () => {
  it('asks to raise the other spouse up to their cap first', () => {
    const { getByTestId } = render(<SpouseCapFirstAlert {...alertProps} />);

    const alert = getByTestId('SpouseCapFirstAlert');
    expect(alert).toHaveTextContent(
      "John's Gross Requested Salary exceeds their individual Maximum Allowable Salary",
    );
    expect(alert).toHaveTextContent(
      "raise Jane's Gross Requested Salary to $50,000.00, which brings them up to their Maximum Allowable Salary",
    );
    expect(alert).not.toHaveTextContent('change how you split');
    expect(alert).not.toHaveTextContent('split automatically');
  });

  // The cap shown on the page is lower than the amount, since it rises as the salary rises
  it("explains that an automatic split's cap goes up with the salary", () => {
    const { getByTestId } = render(
      <SpouseCapFirstAlert {...alertProps} otherCapRises />,
    );

    const alert = getByTestId('SpouseCapFirstAlert');
    expect(alert).toHaveTextContent(
      "Progressive Approvals process. Since your Combined Maximum Allowable Salary is split automatically, Jane's Maximum Allowable Salary goes up as their salary goes up.",
    );
    expect(alert).not.toHaveTextContent('change how you split');
  });

  it('also suggests moving cap when the couple splits the combined cap by hand', () => {
    const { getByTestId } = render(
      <SpouseCapFirstAlert {...alertProps} manuallySplitCap />,
    );

    expect(getByTestId('SpouseCapFirstAlert')).toHaveTextContent(
      'change how you split your Combined Maximum Allowable Salary',
    );
  });
});
