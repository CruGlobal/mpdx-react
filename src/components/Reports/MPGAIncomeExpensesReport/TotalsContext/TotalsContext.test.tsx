import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { mockData } from '../mockData';
import { TotalsProvider, useTotals } from './TotalsContext';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TotalsProvider data={mockData}>
          {<div>Test Children</div>}
        </TotalsProvider>
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

function FailedConsumer() {
  const context = useTotals();
  return <div>{JSON.stringify(context)}</div>;
}

function TestConsumer() {
  const {
    incomeTotal,
    expensesTotal,
    ministryTotal,
    healthcareTotal,
    assessmentTotal,
    benefitsTotal,
    salaryTotal,
    otherTotal,
  } = useTotals();

  return (
    <div>
      <div data-testid="income">{incomeTotal}</div>
      <div data-testid="expenses">{expensesTotal}</div>
      <div data-testid="ministry">{ministryTotal}</div>
      <div data-testid="healthcare">{healthcareTotal}</div>
      <div data-testid="assessment">{assessmentTotal}</div>
      <div data-testid="benefits">{benefitsTotal}</div>
      <div data-testid="salary">{salaryTotal}</div>
      <div data-testid="other">{otherTotal}</div>
    </div>
  );
}

describe('TotalsContext', () => {
  it('throws an error when used outside of the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FailedConsumer />)).toThrow(
      /Could not find TotalsContext/i,
    );
    spy.mockRestore();
  });

  it('provides the correct context values', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <TotalsProvider data={mockData}>
              <TestConsumer />
            </TotalsProvider>
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByTestId('income')).toHaveTextContent('108856');
    expect(getByTestId('expenses')).toHaveTextContent('20969');

    expect(getByTestId('ministry')).toHaveTextContent('2124');
    expect(getByTestId('healthcare')).toHaveTextContent('1933');
    expect(getByTestId('assessment')).toHaveTextContent('13779');
    expect(getByTestId('benefits')).toHaveTextContent('2400');
    expect(getByTestId('salary')).toHaveTextContent('26');
    expect(getByTestId('other')).toHaveTextContent('707');
  });

  it('renders children correctly', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test Children')).toBeInTheDocument();
  });
});
