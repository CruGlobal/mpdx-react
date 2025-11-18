import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { MinisterHousingAllowanceReport } from './MinisterHousingAllowance';
import { useMinisterHousingAllowance } from './Shared/Context/MinisterHousingAllowanceContext';
import { Mock, mocks } from './Shared/mockData';
import { PageEnum } from './Shared/sharedTypes';

const setPreviousPage = jest.fn();

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

jest.mock('./Shared/Context/MinisterHousingAllowanceContext', () => ({
  ...jest.requireActual('./Shared/Context/MinisterHousingAllowanceContext'),
  useMinisterHousingAllowance: jest.fn(),
}));
(useMinisterHousingAllowance as jest.Mock).mockReturnValue({
  setPreviousPage,
});

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

  it('should go back to previous page when clicking back on view page', async () => {
    const { getByText, getByRole, getByTestId, getAllByRole } = render(
      <TestComponent testPerson={mocks[4]} />,
    );

    await userEvent.click(getByText('Edit Request'));

    waitFor(() => {
      expect(
        getByRole('heading', { name: 'About this Form' }),
      ).toBeInTheDocument();

      const continueButton = getByRole('button', { name: 'Continue' });
      userEvent.click(continueButton);
      expect(
        getByRole('heading', { name: 'Rent or Own?' }),
      ).toBeInTheDocument();

      userEvent.click(continueButton);
      expect(
        getByRole('heading', { name: 'Edit Your MHA Request' }),
      ).toBeInTheDocument();

      userEvent.click(continueButton);
      expect(getByRole('dialog')).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Yes, Continue' }));

      expect(
        getByRole('heading', {
          name: 'Thank you for updating your MHA Request!',
        }),
      ).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'View Your MHA' }));
      expect(setPreviousPage).toHaveBeenCalledWith(PageEnum.Edit);
    });

    waitFor(() => {
      expect(
        getByRole('heading', { name: 'Your MHA Request' }),
      ).toBeInTheDocument();
      expect(getByText('Personal Contact Information')).toBeInTheDocument();

      userEvent.click(getByTestId('ArrowBackIcon'));
    });

    waitFor(() => {
      expect(
        getByRole('heading', {
          name: 'Thank you for updating your MHA Request!',
        }),
      ).toBeInTheDocument();

      const steps = getAllByRole('listitem');
      const [firstStep, secondStep, thirdStep] = steps;

      expect(firstStep).toHaveTextContent('1. About this Form');
      expect(
        within(firstStep).getByTestId('CheckCircleIcon'),
      ).toBeInTheDocument();

      expect(secondStep).toHaveTextContent('2. Rent or Own?');
      expect(
        within(secondStep).getByTestId('CheckCircleIcon'),
      ).toBeInTheDocument();

      expect(thirdStep).toHaveTextContent('3. Edit Your MHA');
      expect(
        within(thirdStep).getByTestId('CheckCircleIcon'),
      ).toBeInTheDocument();
    });
  });
});
