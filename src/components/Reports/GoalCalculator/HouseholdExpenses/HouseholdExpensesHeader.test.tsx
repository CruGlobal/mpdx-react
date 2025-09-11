import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '__tests__/util/TestWrapper';
import theme from 'src/theme';
import { HouseholdExpensesHeader } from './HouseholdExpensesHeader';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestWrapper>
      <HouseholdExpensesHeader categoriesTotal={5000} />
    </TestWrapper>
  </ThemeProvider>
);

describe('HouseholdExpensesHeader', () => {
  describe('budgeted card', () => {
    it('should render categories total initially', () => {
      const { getByText } = render(<TestComponent />);

      expect(getByText('$5,000')).toBeInTheDocument();
    });

    it('direct input should update total', () => {
      const { getByRole, getByText } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Direct input' }));

      const directInputTextfield = getByRole('spinbutton', {
        name: 'Direct input',
      });
      userEvent.clear(directInputTextfield);
      userEvent.type(directInputTextfield, '1234');
      userEvent.click(getByRole('button', { name: 'Save' }));

      expect(getByText('$1,234')).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Manual input' }));

      expect(getByText('$5,000')).toBeInTheDocument();
    });

    it('cancel should abort setting direct input', () => {
      const { getByRole, getByText, queryByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Direct input' }));

      const directInputTextfield = getByRole('spinbutton', {
        name: 'Direct input',
      });
      userEvent.clear(directInputTextfield);
      userEvent.type(directInputTextfield, '1234');
      userEvent.click(getByRole('button', { name: 'Cancel' }));

      expect(
        queryByRole('button', { name: 'Manual input' }),
      ).not.toBeInTheDocument();
      expect(getByText('$5,000')).toBeInTheDocument();
    });
  });

  describe('left to allocate card', () => {
    it('should display the amount left to allocate', () => {
      const { getByRole, getByText } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Direct input' }));

      const directInputTextfield = getByRole('spinbutton', {
        name: 'Direct input',
      });
      userEvent.clear(directInputTextfield);
      userEvent.type(directInputTextfield, '7500');
      userEvent.click(getByRole('button', { name: 'Save' }));

      expect(getByText('33%')).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Switch to amount' }));

      expect(getByText('$2,500')).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Switch to percentage' }));

      expect(getByText('33%')).toBeInTheDocument();
    });
  });
});
