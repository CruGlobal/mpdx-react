import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { MinisterHousingAllowanceReport } from './MinisterHousingAllowance';
import { Mock, mocks } from './Shared/mockData';

interface TestComponentProps {
  testPerson: Mock;
}

const TestComponent: React.FC<TestComponentProps> = ({ testPerson }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <MinisterHousingAllowanceReport testPerson={testPerson} />
    </TestRouter>
  </ThemeProvider>
);

describe('MinisterHousingAllowanceReport', () => {
  it('renders single, no pending, no approved correctly', () => {
    const { getByText } = render(<TestComponent testPerson={mocks[0]} />);

    expect(
      getByText(/our records indicate that you have not applied for/i),
    ).toBeInTheDocument();
    expect(getByText('Doe, John')).toBeInTheDocument();
  });

  it('renders married, no pending, no approved correctly', () => {
    const { getByText } = render(<TestComponent testPerson={mocks[1]} />);

    expect(
      getByText(/our records indicate that you have not applied for/i),
    ).toBeInTheDocument();
    expect(
      getByText(/will submit the request for john. jane has not/i),
    ).toBeInTheDocument();
    expect(getByText('Doe, John and Jane')).toBeInTheDocument();
  });

  it('renders married, no pending, approved correctly', () => {
    const { getByText } = render(<TestComponent testPerson={mocks[2]} />);

    expect(
      getByText(/our records indicate that you have an approved/i),
    ).toBeInTheDocument();
    expect(getByText('Doe, John and Jane')).toBeInTheDocument();

    expect(getByText('Current Board Approved MHA')).toBeInTheDocument();
  });

  it('renders single, no pending, approved correctly', () => {
    const { getByText } = render(<TestComponent testPerson={mocks[3]} />);

    expect(
      getByText(/our records indicate that you have an approved/i),
    ).toBeInTheDocument();
    expect(getByText('Doe, John')).toBeInTheDocument();

    expect(getByText('Current Board Approved MHA')).toBeInTheDocument();
  });

  it('renders married, pending, no approved correctly', () => {
    const { getByText } = render(<TestComponent testPerson={mocks[4]} />);

    expect(
      getByText(/our records indicate that you have an mha request/i),
    ).toBeInTheDocument();
    expect(getByText('Doe, John and Jane')).toBeInTheDocument();

    expect(getByText('Current MHA Request')).toBeInTheDocument();
  });
});
