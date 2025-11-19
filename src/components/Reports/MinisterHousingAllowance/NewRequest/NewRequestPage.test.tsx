import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../Shared/sharedTypes';
import { NewRequestPage } from './NewRequestPage';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <MinisterHousingAllowanceProvider type={PageEnum.New}>
        <NewRequestPage />
      </MinisterHousingAllowanceProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('NewRequestPage', () => {
  it('renders steps list', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText(/1. about this form/i)).toBeInTheDocument();
    expect(getByText(/2. rent or own?/i)).toBeInTheDocument();
    expect(getByText(/3. calculate your mha/i)).toBeInTheDocument();
    expect(getByText(/4. receipt/i)).toBeInTheDocument();
  });

  it('updates steps when Continue clicked', async () => {
    const { getByRole, getAllByRole, getByTestId, queryByTestId } = render(
      <TestComponent />,
    );

    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(queryByTestId('ArrowBackIcon')).not.toBeInTheDocument();

    const continueButton = getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    const steps = getAllByRole('listitem');

    const [firstStep, secondStep, thirdStep] = steps;

    expect(firstStep).toHaveTextContent('1. About this Form');
    expect(
      within(firstStep).getByTestId('CheckCircleIcon'),
    ).toBeInTheDocument();

    expect(secondStep).toHaveTextContent('2. Rent or Own?');
    expect(within(secondStep).getByTestId('CircleIcon')).toBeInTheDocument();

    expect(thirdStep).toHaveTextContent('3. Calculate Your MHA');
    expect(
      within(thirdStep).getByTestId('RadioButtonUncheckedIcon'),
    ).toBeInTheDocument();

    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(getByTestId('ArrowBackIcon')).toBeInTheDocument();

    await userEvent.click(getByTestId('ArrowBackIcon'));

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

  it('should show validation error if continue is clicked without selecting an option', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    expect(getByRole('radio', { name: 'Rent' })).not.toBeChecked();
    expect(getByRole('radio', { name: 'Own' })).not.toBeChecked();

    userEvent.click(getByRole('button', { name: /continue/i }));

    const alert = await findByRole('alert');
    expect(alert).toBeInTheDocument();

    expect(alert).toHaveTextContent('Your form is missing information.');
  });

  it('opens confirmation modal when changing selection after calculation values inputted', async () => {
    const { getByRole, getByText, queryByText, findByRole } = render(
      <TestComponent />,
    );

    await userEvent.click(getByRole('button', { name: 'Continue' }));

    await userEvent.click(getByRole('radio', { name: 'Rent' }));
    expect(getByRole('radio', { name: 'Rent' })).toBeChecked();

    await userEvent.click(getByRole('button', { name: 'Continue' }));

    expect(
      queryByText('Are you sure you want to change selection?'),
    ).not.toBeInTheDocument();

    expect(
      await findByRole('heading', { name: 'Calculate Your MHA Request' }),
    ).toBeInTheDocument();

    const row = getByRole('row', {
      name: /monthly rent/i,
    });
    const input = within(row).getByPlaceholderText(/enter amount/i);

    userEvent.type(input, '1500');
    userEvent.tab();

    expect(input).toHaveValue('$1,500.00');

    userEvent.click(getByRole('button', { name: 'Back' }));

    expect(
      await findByRole('heading', { name: 'Rent or Own?' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('radio', { name: 'Own' }));

    expect(
      getByText('Are you sure you want to change selection?'),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: /continue/i }));

    expect(getByRole('radio', { name: 'Own' })).toBeChecked();

    userEvent.click(getByRole('radio', { name: 'Rent' }));
    userEvent.click(getByRole('button', { name: /no/i }));

    expect(getByRole('radio', { name: 'Own' })).toBeChecked();
  });
});
