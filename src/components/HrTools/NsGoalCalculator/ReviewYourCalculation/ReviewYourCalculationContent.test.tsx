import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('prints when the print button is clicked', async () => {
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});
    const { findByRole } = render(
      <NsGoalCalculatorTestWrapper>
        <ReviewYourCalculationContent
          goalCalculation={defaultGoalCalculation}
        />
      </NsGoalCalculatorTestWrapper>,
    );

    userEvent.click(
      await findByRole('button', { name: 'Print MPD Goal Calculation' }),
    );

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
