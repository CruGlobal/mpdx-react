import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../NsGoalCalculatorTestWrapper';
import {
  NsGoalCalculation,
  useNsGoalCalculator,
} from '../Shared/NsGoalCalculatorContext';
import { ReviewYourCalculationStep } from './ReviewYourCalculationStep';

interface TestComponentProps {
  goalCalculation?: NsGoalCalculation;
}

const TestComponent: React.FC<TestComponentProps> = ({
  goalCalculation = defaultGoalCalculation,
}) => (
  <NsGoalCalculatorTestWrapper>
    <CurrentStepProbe />
    <ReviewYourCalculationStep goalCalculation={goalCalculation} />
  </NsGoalCalculatorTestWrapper>
);

const CurrentStepProbe: React.FC = () => {
  const { currentStep } = useNsGoalCalculator();
  return <div data-testid="current-step">{currentStep.title}</div>;
};

describe('ReviewYourCalculationStep', () => {
  it('renders the heading, intro, and summary card', async () => {
    const { findByRole, getByText } = render(<TestComponent />);

    expect(
      await findByRole('heading', {
        name: 'Review Your Calculation',
      }),
    ).toBeInTheDocument();
    expect(getByText('Your MPD Goal Calculation')).toBeInTheDocument();
    expect(getByText('Monthly Needs')).toBeInTheDocument();
    expect(getByText('Special Needs During MPD')).toBeInTheDocument();
    expect(
      getByText('Min Staff Account Balance Upon Reporting'),
    ).toBeInTheDocument();
  });

  it('names both spouses in the card columns when married', async () => {
    const { findAllByRole } = render(<TestComponent />);

    // The cards with a person column all name both spouses.
    expect(
      await findAllByRole('columnheader', { name: 'John & Jane' }),
    ).toHaveLength(3);
  });

  it('names only the staff member in the card columns when single', async () => {
    const { findAllByRole, queryByRole } = render(
      <TestComponent
        goalCalculation={{
          ...defaultGoalCalculation,
          maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
        }}
      />,
    );

    expect(await findAllByRole('columnheader', { name: 'John' })).toHaveLength(
      3,
    );
    expect(
      queryByRole('columnheader', { name: 'John & Jane' }),
    ).not.toBeInTheDocument();
  });

  it('advances to the next step when the continue button is clicked', async () => {
    const { findByRole, getByTestId } = render(<TestComponent />);

    expect(getByTestId('current-step')).toHaveTextContent(
      'Review Your Calculation',
    );

    userEvent.click(await findByRole('button', { name: 'Continue' }));

    await waitFor(() =>
      expect(getByTestId('current-step')).toHaveTextContent(
        'Presenting Your Goal',
      ),
    );
  });
});
