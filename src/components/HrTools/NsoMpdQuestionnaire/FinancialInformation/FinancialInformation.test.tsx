import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { FinancialInformation } from './FinancialInformation';

const TestComponent: React.FC = () => (
  <NsoMpdQuestionnaireTestWrapper>
    <FinancialInformation />
  </NsoMpdQuestionnaireTestWrapper>
);

const studentLoanQuestion =
  'What is your monthly payment for all of your student loan debt?';
const carQuestion = 'What is your monthly payment for all of your car debt?';
const creditCardQuestion =
  'What is your monthly payment for all of your credit card debt?';

describe('FinancialInformation', () => {
  it('renders the heading and intro', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Financial Information' }),
    ).toBeInTheDocument();
    expect(
      getByText('Tell us about your financial situation.'),
    ).toBeInTheDocument();
  });

  it('keeps Continue enabled even before the debt question is answered', () => {
    const { getByRole } = render(<TestComponent />);

    // Gating moved to the Summary step, so Continue is never disabled here.
    expect(getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('reveals the three payment questions when Yes is selected', async () => {
    const { getByRole, findByRole, queryByRole } = render(<TestComponent />);

    // The payment questions are hidden until the debt question is answered Yes.
    expect(
      queryByRole('spinbutton', { name: studentLoanQuestion }),
    ).not.toBeInTheDocument();

    userEvent.click(getByRole('radio', { name: 'Yes' }));

    expect(
      await findByRole('spinbutton', { name: studentLoanQuestion }),
    ).toBeInTheDocument();
    expect(getByRole('spinbutton', { name: carQuestion })).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: creditCardQuestion }),
    ).toBeInTheDocument();
  });
});
