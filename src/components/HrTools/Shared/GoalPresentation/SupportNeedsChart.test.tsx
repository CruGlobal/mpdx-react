import React from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { NeedsCategory, SupportNeedsChart } from './SupportNeedsChart';

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

const needsCategories: NeedsCategory[] = [
  { title: 'Salary (Combined)', amount: 5000 },
  { title: 'Ministry Expenses', amount: 1000 },
  { title: 'Benefits', amount: 800 },
  { title: 'Social Security and Taxes', amount: 600 },
  { title: 'Voluntary 403b Retirement Plan', amount: 400 },
  { title: 'Administrative Charge', amount: 200 },
];

describe('SupportNeedsChart', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('renders a pie chart of the needs categories', async () => {
    const { container } = render(
      <SupportNeedsChart needsCategories={needsCategories} />,
    );

    await waitFor(() =>
      expect(container.querySelector('.recharts-pie')).toBeInTheDocument(),
    );
  });

  it('renders a legend entry for each needs category', async () => {
    const { container } = render(
      <SupportNeedsChart needsCategories={needsCategories} />,
    );

    await waitFor(() =>
      expect(
        container.querySelector('.recharts-legend-wrapper'),
      ).toBeInTheDocument(),
    );

    const legend = container.querySelector('.recharts-legend-wrapper');
    needsCategories.forEach(({ title }) =>
      expect(legend?.textContent).toMatch(title),
    );
  });
});
