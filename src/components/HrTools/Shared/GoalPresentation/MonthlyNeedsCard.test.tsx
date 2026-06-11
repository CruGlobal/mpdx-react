import React from 'react';
import { render } from '@testing-library/react';
import { MonthlyNeedsCard } from './MonthlyNeedsCard';
import { MonthlyNeeds } from './useMonthlyNeedsRows';

const monthlyNeeds: MonthlyNeeds = {
  married: true,
  salary: 5000,
  ministryExpenses: 1000,
  benefits: 800,
  socialSecurityAndTaxes: 600,
  voluntaryRetirement: 400,
  adminCharge: 200,
};

describe('MonthlyNeedsCard', () => {
  it('renders the card title and all monthly needs rows', () => {
    const { getByRole, getByText } = render(
      <MonthlyNeedsCard monthlyNeeds={monthlyNeeds} supportRaised={1234} />,
    );

    expect(
      getByRole('heading', { name: 'Monthly Support Needs' }),
    ).toBeInTheDocument();
    expect(getByText('Salary (Combined)')).toBeInTheDocument();
    expect(getByText('$5,000')).toBeInTheDocument();
    expect(getByText('Ministry Expenses')).toBeInTheDocument();
    expect(getByText('$1,000')).toBeInTheDocument();
    expect(getByText('Benefits')).toBeInTheDocument();
    expect(getByText('$800')).toBeInTheDocument();
    expect(getByText('Social Security and Taxes')).toBeInTheDocument();
    expect(getByText('$600')).toBeInTheDocument();
    expect(getByText('Voluntary 403b Retirement Plan')).toBeInTheDocument();
    expect(getByText('$400')).toBeInTheDocument();
    expect(getByText('Administrative Charge')).toBeInTheDocument();
    expect(getByText('$200')).toBeInTheDocument();
  });

  it('renders the single salary title when not married', () => {
    const { getByText } = render(
      <MonthlyNeedsCard
        monthlyNeeds={{ ...monthlyNeeds, married: false }}
        supportRaised={1234}
      />,
    );

    expect(getByText('Salary')).toBeInTheDocument();
  });

  it('totals the monthly needs rows into the support goal', () => {
    const { getByText } = render(
      <MonthlyNeedsCard monthlyNeeds={monthlyNeeds} supportRaised={1234} />,
    );

    expect(getByText('Total Support Goal')).toBeInTheDocument();
    expect(getByText('$8,000')).toBeInTheDocument();
  });

  it('renders the support raised as total solid support', () => {
    const { getByText } = render(
      <MonthlyNeedsCard monthlyNeeds={monthlyNeeds} supportRaised={1234} />,
    );

    expect(getByText('Total Solid Support')).toBeInTheDocument();
    expect(getByText('$1,234')).toBeInTheDocument();
  });
});
