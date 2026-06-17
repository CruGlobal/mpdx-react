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

  it('keeps Continue disabled until the debt question is answered', () => {
    const { getByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();

    userEvent.click(getByRole('radio', { name: 'No' }));

    expect(continueButton).toBeEnabled();
  });

  it('requires all three payment amounts when Yes is selected', () => {
    const { getByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'Continue' });

    userEvent.click(getByRole('radio', { name: 'Yes' }));
    expect(continueButton).toBeDisabled();

    userEvent.type(
      getByRole('spinbutton', { name: studentLoanQuestion }),
      '500',
    );
    userEvent.type(getByRole('spinbutton', { name: carQuestion }), '0');
    expect(continueButton).toBeDisabled();

    userEvent.type(getByRole('spinbutton', { name: creditCardQuestion }), '0');
    expect(continueButton).toBeEnabled();
  });
});
