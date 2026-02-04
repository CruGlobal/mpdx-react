import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { SummaryStep } from './Summary';

interface TestComponentProps {
  print?: boolean;
  editing?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ print, editing }) => (
  <SalaryCalculatorTestWrapper editing={editing}>
    <TestRouter
      router={{
        query: {
          accountListId: 'account-list-1',
          ...(print ? { print: 'true' } : {}),
        },
      }}
    >
      <SummaryStep />
    </TestRouter>
  </SalaryCalculatorTestWrapper>
);

describe('SummaryStep', () => {
  describe('View Complete Calculations button', () => {
    it('should toggle calculation cards', async () => {
      const { findByRole, getByText, queryByText } = render(<TestComponent />);

      const button = await findByRole('button', {
        name: 'View Complete Calculations',
      });

      userEvent.click(button);
      expect(getByText('Salary Cap Calculation')).toBeInTheDocument();

      userEvent.click(button);
      expect(queryByText('Salary Cap Calculation')).not.toBeInTheDocument();
    });
  });

  describe('print behavior', () => {
    const printSpy = jest.spyOn(window, 'print');

    it('should call print when print query param is true', async () => {
      render(<TestComponent print />);

      await waitFor(() => {
        expect(printSpy).toHaveBeenCalled();
      });
    });

    it('should not call print when print query param is not present', async () => {
      render(<TestComponent />);

      await waitFor(() => {
        expect(printSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('view mode behavior', () => {
    it('should hide instructional text in view mode', async () => {
      const { queryByText, findByText } = render(
        <TestComponent editing={false} />,
      );

      expect(await findByText('Summary')).toBeInTheDocument();

      expect(
        queryByText(/Please review the detailed summary/),
      ).not.toBeInTheDocument();
    });

    it('should show instructional text in edit mode', async () => {
      const { findByText } = render(<TestComponent editing />);

      expect(
        await findByText(/Please review the detailed summary/),
      ).toBeInTheDocument();
    });
  });
});
