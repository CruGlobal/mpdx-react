import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { PageEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { MinisterHousingAllowanceProvider } from '../Shared/Context/MinisterHousingAllowanceContext';
import { EditRequestPage } from './EditRequestPage';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <MinisterHousingAllowanceProvider type={PageEnum.Edit}>
        <EditRequestPage />
      </MinisterHousingAllowanceProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('EditRequestPage', () => {
  it('renders steps list', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText(/1. about this form/i)).toBeInTheDocument();
    expect(getByText(/2. rent or own?/i)).toBeInTheDocument();
    expect(getByText(/3. edit your mha/i)).toBeInTheDocument();
    expect(getByText(/4. receipt/i)).toBeInTheDocument();
  });

  it('updates steps when Continue clicked', async () => {
    const { getByRole, getAllByRole, getByText, queryByTestId } = render(
      <TestComponent />,
    );

    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(queryByTestId('ArrowBackIcon')).toBeInTheDocument();

    const continueButton = getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    await waitFor(() => {
      expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    });

    await waitFor(() => {
      const steps = getAllByRole('listitem');

      const [firstStep, secondStep, thirdStep] = steps;

      expect(firstStep).toHaveTextContent('1. About this Form');
      expect(
        within(firstStep).getByTestId('CheckCircleIcon'),
      ).toBeInTheDocument();

      expect(secondStep).toHaveTextContent('2. Rent or Own?');
      expect(within(secondStep).getByTestId('CircleIcon')).toBeInTheDocument();

      expect(thirdStep).toHaveTextContent('3. Edit Your MHA');
      expect(
        within(thirdStep).getByTestId('RadioButtonUncheckedIcon'),
      ).toBeInTheDocument();
    });

    await userEvent.click(getByText('Back'));

    const updatedSteps = getAllByRole('listitem');

    const [updatedFirstStep, updatedSecondStep] = updatedSteps;

    expect(updatedFirstStep).toHaveTextContent('1. About this Form');
    expect(
      within(updatedFirstStep).getByTestId('CircleIcon'),
    ).toBeInTheDocument();

    expect(updatedSecondStep).toHaveTextContent('2. Rent or Own?');
    expect(
      within(updatedSecondStep).getByTestId('RadioButtonUncheckedIcon'),
    ).toBeInTheDocument();

    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  it('should show an option is preselected', async () => {
    const { getAllByRole, getByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    expect(getAllByRole('radio', { checked: true })).toHaveLength(1);
  });

  it('opens confirmation modal when changing selection', async () => {
    const { getByRole, getByText, getAllByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    const radios = getAllByRole('radio');
    const unchecked = radios.filter((r) => !(r as HTMLInputElement).checked);
    const checked = radios.filter((r) => (r as HTMLInputElement).checked);

    await userEvent.click(unchecked[0]);
    expect(checked[0]).toBeChecked();

    expect(
      getByText('Are you sure you want to change selection?'),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: /continue/i }));

    expect(unchecked[0]).toBeChecked();
  });
});
