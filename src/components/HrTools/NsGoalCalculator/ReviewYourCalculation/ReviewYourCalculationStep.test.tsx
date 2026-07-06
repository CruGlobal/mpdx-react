import React from 'react';
import { render } from '@testing-library/react';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../NsGoalCalculatorTestWrapper';
import { ReviewYourCalculationStep } from './ReviewYourCalculationStep';

describe('ReviewYourCalculationStep', () => {
  it('renders the heading, intro, and summary card', async () => {
    const { findByRole, getByText } = render(
      <NsGoalCalculatorTestWrapper>
        <ReviewYourCalculationStep goalCalculation={defaultGoalCalculation} />
      </NsGoalCalculatorTestWrapper>,
    );

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
    const { findAllByRole } = render(
      <NsGoalCalculatorTestWrapper>
        <ReviewYourCalculationStep goalCalculation={defaultGoalCalculation} />
      </NsGoalCalculatorTestWrapper>,
    );

    // The cards with a person column all name both spouses.
    expect(
      await findAllByRole('columnheader', { name: 'John & Jane' }),
    ).toHaveLength(3);
  });

  it('names only the staff member in the card columns when single', async () => {
    const { findAllByRole, queryByRole } = render(
      <NsGoalCalculatorTestWrapper>
        <ReviewYourCalculationStep
          goalCalculation={{
            ...defaultGoalCalculation,
            maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
          }}
        />
      </NsGoalCalculatorTestWrapper>,
    );

    expect(await findAllByRole('columnheader', { name: 'John' })).toHaveLength(
      3,
    );
    expect(
      queryByRole('columnheader', { name: 'John & Jane' }),
    ).not.toBeInTheDocument();
  });

  it('renders a continue button', async () => {
    const { findByRole } = render(
      <NsGoalCalculatorTestWrapper>
        <ReviewYourCalculationStep goalCalculation={defaultGoalCalculation} />
      </NsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument();
  });
});
