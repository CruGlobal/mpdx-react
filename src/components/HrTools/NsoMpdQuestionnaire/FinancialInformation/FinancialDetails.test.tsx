import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { FinancialDetails } from './FinancialDetails';

const mutationSpy = jest.fn();

const TestComponent: React.FC<{
  onCall?: MockLinkCallHandler;
  newStaffQuestionnaire?: React.ComponentProps<
    typeof NsoMpdQuestionnaireTestWrapper
  >['newStaffQuestionnaire'];
}> = ({ onCall, newStaffQuestionnaire }) => (
  <NsoMpdQuestionnaireTestWrapper
    onCall={onCall}
    newStaffQuestionnaire={newStaffQuestionnaire}
  >
    <FinancialDetails />
  </NsoMpdQuestionnaireTestWrapper>
);

const studentLoanQuestion =
  'What is your monthly payment for all of your student loan debt?';
const carQuestion = 'What is your monthly payment for all of your car debt?';
const creditCardQuestion =
  'What is your monthly payment for all of your credit card debt?';
const requiredError = 'Please enter an amount, or 0 if you have none.';

describe('FinancialDetails', () => {
  it('renders the debt question with Yes and No options', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('radiogroup', {
        name: 'Do you have any student loan, car, or credit card debt?',
      }),
    ).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Yes' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'No' })).toBeInTheDocument();
  });

  it('seeds "Yes" and reveals the payment fields when debt is already saved', async () => {
    const { findByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{ studentLoanMonthlyPayment: 50 }}
      />,
    );

    expect(
      await findByRole('radio', { name: 'Yes', checked: true }),
    ).toBeInTheDocument();
    expect(
      await findByRole('spinbutton', { name: studentLoanQuestion }),
    ).toBeInTheDocument();
  });

  it('seeds "Yes" when some debt fields are saved and the rest are null', async () => {
    const { findByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{
          studentLoanMonthlyPayment: 50,
          carLoanMonthlyPayment: null,
          creditCardDebtMonthlyPayment: null,
        }}
      />,
    );

    expect(
      await findByRole('radio', { name: 'Yes', checked: true }),
    ).toBeInTheDocument();
  });

  it('seeds "No" when all debt fields are saved as 0', async () => {
    const { findByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{
          studentLoanMonthlyPayment: 0,
          carLoanMonthlyPayment: 0,
          creditCardDebtMonthlyPayment: 0,
        }}
      />,
    );

    expect(
      await findByRole('radio', { name: 'No', checked: true }),
    ).toBeInTheDocument();
  });

  it('shows the debt-question error once the group is touched without a selection', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    getByRole('radio', { name: 'Yes' }).focus();
    userEvent.tab();

    expect(getByText('Please select an answer.')).toBeInTheDocument();
  });

  it('hides the payment fields until Yes is selected', () => {
    const { queryByRole } = render(<TestComponent />);

    expect(
      queryByRole('spinbutton', { name: studentLoanQuestion }),
    ).not.toBeInTheDocument();
  });

  it('reveals all three payment fields when Yes is selected', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('radio', { name: 'Yes' }));

    expect(
      getByRole('spinbutton', { name: studentLoanQuestion }),
    ).toBeInTheDocument();
    expect(getByRole('spinbutton', { name: carQuestion })).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: creditCardQuestion }),
    ).toBeInTheDocument();
  });

  it('hides the payment fields again when switching to No', () => {
    const { getByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('radio', { name: 'Yes' }));
    expect(
      getByRole('spinbutton', { name: studentLoanQuestion }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('radio', { name: 'No' }));
    expect(
      queryByRole('spinbutton', { name: studentLoanQuestion }),
    ).not.toBeInTheDocument();
  });

  it('shows a required error on each payment field once it is touched', () => {
    const { getByRole, getAllByText } = render(<TestComponent />);

    userEvent.click(getByRole('radio', { name: 'Yes' }));

    [studentLoanQuestion, carQuestion, creditCardQuestion].forEach((name) => {
      getByRole('spinbutton', { name }).focus();
      userEvent.tab();
    });

    expect(getAllByText(requiredError)).toHaveLength(3);
  });

  it('accepts 0 as a valid amount', () => {
    const { getByRole, queryByText } = render(<TestComponent />);

    userEvent.click(getByRole('radio', { name: 'Yes' }));
    userEvent.type(getByRole('spinbutton', { name: studentLoanQuestion }), '0');
    userEvent.type(getByRole('spinbutton', { name: carQuestion }), '0');
    userEvent.type(getByRole('spinbutton', { name: creditCardQuestion }), '0');

    expect(queryByText(requiredError)).not.toBeInTheDocument();
  });

  it('saves zero for every debt field when the user has no debt', async () => {
    const { getByRole } = render(<TestComponent onCall={mutationSpy} />);

    userEvent.click(getByRole('radio', { name: 'No' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffQuestionnaire',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              studentLoanMonthlyPayment: 0,
              carLoanMonthlyPayment: 0,
              creditCardDebtMonthlyPayment: 0,
            },
          },
        },
      ),
    );
  });
});
