import React from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { SupportNeedsChart } from './SupportNeedsChart';
import { MonthlyNeeds } from './useMonthlyNeedsRows';

/*
 * Mocking recharts ResponsiveContainer to avoid ResponsiveContainer
 * width and height issue
 * https://jskim1991.medium.com/react-writing-tests-with-graphs-9b7f2c9eeefc
 */
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

const monthlyNeeds: MonthlyNeeds = {
  married: true,
  salary: 5000,
  ministryExpenses: 1000,
  benefits: 800,
  socialSecurityAndTaxes: 600,
  voluntaryRetirement: 400,
  adminCharge: 200,
};

describe('SupportNeedsChart', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('renders a pie chart of the monthly needs', async () => {
    const { container } = render(
      <SupportNeedsChart monthlyNeeds={monthlyNeeds} />,
    );

    await waitFor(() =>
      expect(container.querySelector('.recharts-pie')).toBeInTheDocument(),
    );
  });

  it('renders a legend entry for each monthly needs row', async () => {
    const { container } = render(
      <SupportNeedsChart monthlyNeeds={monthlyNeeds} />,
    );

    await waitFor(() =>
      expect(
        container.querySelector('.recharts-legend-wrapper'),
      ).toBeInTheDocument(),
    );

    const legend = container.querySelector('.recharts-legend-wrapper');
    expect(legend?.textContent).toMatch('Salary (Combined)');
    expect(legend?.textContent).toMatch('Ministry Expenses');
    expect(legend?.textContent).toMatch('Benefits');
    expect(legend?.textContent).toMatch('Social Security and Taxes');
    expect(legend?.textContent).toMatch('Voluntary 403b Retirement Plan');
    expect(legend?.textContent).toMatch('Administrative Charge');
  });
});
