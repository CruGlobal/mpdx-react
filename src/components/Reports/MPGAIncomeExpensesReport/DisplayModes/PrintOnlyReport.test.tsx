import React from 'react';
import { render } from '@testing-library/react';
import { MPGAIncomeExpensesReportTestWrapper } from '../MPGAIncomeExpensesReportTestWrapper';
import { PrintOnlyReport } from './PrintOnlyReport';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy}>
    <PrintOnlyReport />
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

describe('PrintOnlyReport', () => {
  it('renders data correctly', async () => {
    const { getByRole, findAllByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Summary' })).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Expenses Categories' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Monthly Summary' }),
    ).toBeInTheDocument();

    expect(await findAllByRole('table')).toHaveLength(3);
    expect(getByRole('cell', { name: 'Donation' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Assessment' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Ending Balance' })).toBeInTheDocument();
  });

  it('displays the tables that should be showing', async () => {
    const { findAllByRole, getByText } = render(
      <MPGAIncomeExpensesReportTestWrapper onCall={mutationSpy} isEmpty>
        <PrintOnlyReport />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    expect(await findAllByRole('table')).toHaveLength(3);
    expect(
      getByText(/no income data available in the last 12 months/i),
    ).toBeInTheDocument();
    expect(
      getByText(/no expenses data available in the last 12 months/i),
    ).toBeInTheDocument();
    expect(
      getByText(
        /no primary account balance data available in the last 12 months/i,
      ),
    ).toBeInTheDocument();
  });
});
