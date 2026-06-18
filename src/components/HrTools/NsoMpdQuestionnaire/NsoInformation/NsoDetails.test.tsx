import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { NsoDetails } from './NsoDetails';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <NsoDetails />
  </ThemeProvider>
);

describe('NsoDetails', () => {
  it('renders the housing question with all options', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('radiogroup', {
        name: 'Which of the following describes your NSO housing?',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('radio', { name: 'Single in hotel/dorm room' }),
    ).toBeInTheDocument();
    expect(
      getByRole('radio', { name: 'Sharing 2 in hotel/dorm room' }),
    ).toBeInTheDocument();
    expect(
      getByRole('radio', { name: 'Couple in hotel/dorm room' }),
    ).toBeInTheDocument();
    expect(
      getByRole('radio', { name: 'Family in a hotel/room' }),
    ).toBeInTheDocument();
    expect(
      getByRole('radio', { name: 'Local / Commuting' }),
    ).toBeInTheDocument();
  });

  it('renders the sessions question with both options', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('radiogroup', {
        name: 'Which describes the sessions you are attending?',
      }),
    ).toBeInTheDocument();
    expect(getByRole('radio', { name: 'IBS and NSO' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'NSO' })).toBeInTheDocument();
  });

  it('renders the special needs support and childcare fields', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('spinbutton', {
        name: 'How much special needs support have you already received for NSO?',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', {
        name: 'If you are a parent with children in Childcare, please enter how many.',
      }),
    ).toBeInTheDocument();
  });

  it('shows the required error on a numeric field once it is touched', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    getByRole('spinbutton', {
      name: 'How much special needs support have you already received for NSO?',
    }).focus();
    userEvent.tab();

    expect(
      getByText('Please enter an amount, or 0 if you have none.'),
    ).toBeInTheDocument();
  });

  it('accepts 0 in the numeric fields', () => {
    const { getByRole, queryByText } = render(<TestComponent />);

    userEvent.type(
      getByRole('spinbutton', {
        name: 'How much special needs support have you already received for NSO?',
      }),
      '0',
    );
    userEvent.type(
      getByRole('spinbutton', {
        name: 'If you are a parent with children in Childcare, please enter how many.',
      }),
      '0',
    );

    expect(
      queryByText('Please enter an amount, or 0 if you have none.'),
    ).not.toBeInTheDocument();
    expect(
      queryByText('Please enter a number, or 0 if you have none.'),
    ).not.toBeInTheDocument();
  });
});
