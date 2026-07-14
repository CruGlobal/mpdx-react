import React from 'react';
import { render } from '@testing-library/react';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../NsGoalCalculatorTestWrapper';
import { ReviewYourCalculationContent } from './ReviewYourCalculationContent';

describe('ReviewYourCalculationContent', () => {
  it('renders the review heading and summary cards', async () => {
    const { findByRole, getByText } = render(
      <NsGoalCalculatorTestWrapper>
        <ReviewYourCalculationContent
          goalCalculation={defaultGoalCalculation}
        />
      </NsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'Review Your Calculation' }),
    ).toBeInTheDocument();
    expect(getByText('Your MPD Goal Calculation')).toBeInTheDocument();
    expect(getByText('Monthly Needs')).toBeInTheDocument();
    expect(getByText('Minimum Staff Account Balance')).toBeInTheDocument();
  });

  it('renders the footer when provided', async () => {
    const { findByText } = render(
      <NsGoalCalculatorTestWrapper>
        <ReviewYourCalculationContent
          goalCalculation={defaultGoalCalculation}
          footer={<button type="button">Continue</button>}
        />
      </NsGoalCalculatorTestWrapper>,
    );

    expect(await findByText('Continue')).toBeInTheDocument();
  });
});
