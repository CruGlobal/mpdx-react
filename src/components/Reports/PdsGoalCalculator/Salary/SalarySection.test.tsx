import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DesignationSupportSalaryType } from 'src/graphql/types.generated';
import {
  PdsGoalCalculationMock,
  PdsGoalCalculatorTestWrapper,
} from '../PdsGoalCalculatorTestWrapper';
import { SalarySection } from './SalarySection';

interface Props {
  calculationMock?: PdsGoalCalculationMock;
}

const TestComponent: React.FC<Props> = ({ calculationMock }) => (
  <PdsGoalCalculatorTestWrapper calculationMock={calculationMock}>
    <SalarySection />
  </PdsGoalCalculatorTestWrapper>
);

describe('SalarySection', () => {
  it('renders the Salary heading', async () => {
    const { findByRole } = render(
      <TestComponent
        calculationMock={{
          salaryOrHourly: DesignationSupportSalaryType.Salaried,
          // Yearly salary — divided by 12 for monthly base
          payRate: 60000,
          hoursWorkedPerWeek: null,
          geographicLocation: null,
        }}
      />,
    );

    expect(await findByRole('heading', { name: 'Salary' })).toBeInTheDocument();
  });

  describe('salaried breakdown', () => {
    it('renders a six-row breakdown for a salaried user with no geographic multiplier', async () => {
      const { findByTestId, getByTestId, getByRole } = render(
        <TestComponent
          calculationMock={{
            salaryOrHourly: DesignationSupportSalaryType.Salaried,
            // Yearly salary — divided by 12 for monthly base
            payRate: 60000,
            hoursWorkedPerWeek: null,
            geographicLocation: null,
          }}
        />,
      );

      await findByTestId('gross-monthly-pay');

      // 60000 / 12 = 5000 monthly base
      const monthlyBaseRow = getByRole('gridcell', {
        name: /Monthly Base.*Pay Rate ÷ 12/,
      }).closest('[role="row"]');
      expect(monthlyBaseRow).toHaveTextContent('$5,000');

      expect(getByTestId('gross-monthly-pay')).toHaveTextContent('$5,000');
      expect(getByTestId('employer-fica')).toHaveTextContent('$400');
      expect(getByTestId('salary-subtotal')).toHaveTextContent('$5,400');
    });

    it('applies the geographic multiplier additively and surfaces the percent in the breakdown', async () => {
      const { findByTestId, getByTestId, getByRole } = render(
        <TestComponent
          calculationMock={{
            salaryOrHourly: DesignationSupportSalaryType.Salaried,
            // Yearly salary — divided by 12 for monthly base
            payRate: 60000,
            hoursWorkedPerWeek: null,
            // Orlando seeds at 0.06
            geographicLocation: 'Orlando, FL',
          }}
        />,
      );

      await findByTestId('gross-monthly-pay');

      const geoRow = getByRole('gridcell', {
        name: 'Geographic Multiplier',
      }).closest('[role="row"]');
      expect(geoRow).toHaveTextContent('6%');

      // (60000 / 12) * (1 + 0.06) = 5300
      expect(getByTestId('gross-monthly-pay')).toHaveTextContent('$5,300');
      // 5300 * 0.08
      expect(getByTestId('employer-fica')).toHaveTextContent('$424');
      // 5300 + 424
      expect(getByTestId('salary-subtotal')).toHaveTextContent('$5,724');
    });
  });

  describe('hourly breakdown', () => {
    it('renders Hours per Week and Monthly Base rows and uses the hourly formula', async () => {
      const { findByTestId, getByTestId, getByRole } = render(
        <TestComponent
          calculationMock={{
            salaryOrHourly: DesignationSupportSalaryType.Hourly,
            payRate: 25,
            hoursWorkedPerWeek: 40,
            geographicLocation: null,
          }}
        />,
      );

      await findByTestId('gross-monthly-pay');

      const hoursRow = getByRole('gridcell', {
        name: 'Hours per Week',
      }).closest('[role="row"]');
      expect(hoursRow).toHaveTextContent('40');

      const monthlyBaseRow = getByRole('gridcell', {
        name: /Monthly Base.*Pay Rate × Hours per Week/,
      }).closest('[role="row"]');
      // 25 * 40 * 52 / 12 = 4333.33
      expect(monthlyBaseRow).toHaveTextContent('$4,333.33');

      expect(getByTestId('gross-monthly-pay')).toHaveTextContent('$4,333.33');
      // 4333.33 * 0.08 = 346.67
      expect(getByTestId('employer-fica')).toHaveTextContent('$346.67');
      // 4333.33 + 346.67 = 4680.00
      expect(getByTestId('salary-subtotal')).toHaveTextContent('$4,680');
    });
  });

  it('renders nothing when the EMPLOYER_FICA_RATE constant is missing', async () => {
    const { container, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          salaryOrHourly: DesignationSupportSalaryType.Salaried,
          // Yearly salary — divided by 12 for monthly base
          payRate: 60000,
          hoursWorkedPerWeek: null,
          geographicLocation: null,
        }}
        constantsMock={{ mpdGoalMiscConstants: [] }}
      >
        <SalarySection />
      </PdsGoalCalculatorTestWrapper>,
    );

    await waitFor(() =>
      expect(
        queryByRole('heading', { name: 'Salary' }),
      ).not.toBeInTheDocument(),
    );
    expect(container).toBeEmptyDOMElement();
  });
});
