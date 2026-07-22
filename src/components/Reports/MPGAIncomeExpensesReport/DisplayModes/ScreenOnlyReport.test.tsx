import React from 'react';
import { render } from '@testing-library/react';
import { MPGAIncomeExpensesReportTestWrapper } from '../MPGAIncomeExpensesReportTestWrapper';
import { ScreenOnlyReport } from './ScreenOnlyReport';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
    <ScreenOnlyReport />
  </MPGAIncomeExpensesReportTestWrapper>
);

const resizeObserverMock = () => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
beforeAll(() => {
  window.ResizeObserver = jest.fn().mockImplementation(resizeObserverMock);
});

describe('ScreenOnlyReport', () => {
  it('renders data correctly', async () => {
    const { getByRole, findAllByRole } = render(<TestComponent />);

    expect(await findAllByRole('grid')).toHaveLength(4);
    expect(getByRole('gridcell', { name: 'Donation' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Assessment' })).toBeInTheDocument();
  });

  it('shows empty placeholders when there is no data', async () => {
    const { findByText, getByText, queryAllByRole } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy} isEmpty>
        <ScreenOnlyReport />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    expect(await findByText('No Income data available')).toBeInTheDocument();
    expect(getByText('No Expenses data available')).toBeInTheDocument();
    expect(queryAllByRole('grid')).toHaveLength(0);
  });
});
