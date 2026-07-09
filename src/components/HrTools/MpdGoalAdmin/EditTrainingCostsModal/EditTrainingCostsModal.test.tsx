import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { TrainingCosts } from '../mpdGoalAdminHelpers';
import { EditTrainingCostsModal } from './EditTrainingCostsModal';

const filledCosts: TrainingCosts = {
  nsoIbsIndividual1InRoom: 100,
  nsoIbsIndividual2InRoom: 200,
  nsoIbsCouple: 300,
  nsoIbsFamily: 400,
  refreshRetreatSingle: 500,
  refreshRetreatCouple: 600,
  faithAndFinanceSingle: 700,
  faithAndFinanceCouple: 800,
  cruConferenceSingle: 900,
  cruConferenceCouple: 1000,
  cruConferenceFamily: 1100,
};

const setup = (
  overrides: Partial<React.ComponentProps<typeof EditTrainingCostsModal>> = {},
) => {
  const onClose = jest.fn();
  const onSave = jest.fn();
  const utils = render(
    <ThemeProvider theme={theme}>
      <EditTrainingCostsModal
        open
        cohortName="Fall NSO 2026"
        onClose={onClose}
        onSave={onSave}
        {...overrides}
      />
    </ThemeProvider>,
  );
  return { onClose, onSave, ...utils };
};

describe('EditTrainingCostsModal', () => {
  it('renders the cohort-specific title, subtitle and every section', () => {
    const { getByText, getByRole } = setup();
    expect(
      getByRole('heading', { name: 'Training Costs for Fall NSO 2026' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        'Please enter the cost details that apply to this training. All fields are required.',
      ),
    ).toBeInTheDocument();
    expect(getByText('NSO & IBS Cost')).toBeInTheDocument();
    expect(getByText('Refresh Retreat')).toBeInTheDocument();
    expect(getByText('Faith and Finance')).toBeInTheDocument();
    expect(getByText('Cru Conference')).toBeInTheDocument();
  });

  it('falls back to a generic title when no cohort name is given', () => {
    const { getByRole } = setup({ cohortName: undefined });
    expect(
      getByRole('heading', { name: 'Training Costs' }),
    ).toBeInTheDocument();
  });

  it('renders all eleven cost inputs, initially blank', () => {
    const { getAllByRole } = setup();
    const inputs = getAllByRole('spinbutton');
    expect(inputs).toHaveLength(11);
    inputs.forEach((input) => expect(input).toHaveValue(null));
  });

  it('prefills the inputs from initialCosts', () => {
    const { getAllByRole } = setup({ initialCosts: filledCosts });
    const inputs = getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(100);
    expect(inputs[10]).toHaveValue(1100);
  });

  it('disables Apply until every field is valid', async () => {
    const { getByRole, getAllByRole } = setup();
    const apply = getByRole('button', { name: 'Apply' });
    expect(apply).toBeDisabled();

    const inputs = getAllByRole('spinbutton');
    for (let i = 0; i < inputs.length; i++) {
      await userEvent.type(inputs[i], String((i + 1) * 100));
    }

    await waitFor(() => expect(apply).toBeEnabled());
  });

  it('surfaces a validation error and keeps Apply disabled for a negative amount', async () => {
    const { getByRole, getAllByRole, findByText } = setup();
    const inputs = getAllByRole('spinbutton');

    // Enter a negative amount in the first field and valid amounts elsewhere.
    await userEvent.type(inputs[0], '-5');
    for (let i = 1; i < inputs.length; i++) {
      await userEvent.type(inputs[i], String((i + 1) * 100));
    }
    // Blur the last field so every field is touched and validation has run.
    await userEvent.tab();

    expect(
      await findByText('Amount must be 0 or more'),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('keeps Apply disabled when a required field is left blank', async () => {
    const { getByRole, getAllByRole } = setup();
    const inputs = getAllByRole('spinbutton');

    // Fill every field except the first, which stays blank.
    for (let i = 1; i < inputs.length; i++) {
      await userEvent.type(inputs[i], String((i + 1) * 100));
    }

    expect(getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('saves parsed numeric costs when applied', async () => {
    const { getByRole, getAllByRole, onSave } = setup();
    const inputs = getAllByRole('spinbutton');
    for (let i = 0; i < inputs.length; i++) {
      await userEvent.type(inputs[i], String((i + 1) * 100));
    }

    const apply = getByRole('button', { name: 'Apply' });
    await waitFor(() => expect(apply).toBeEnabled());
    await userEvent.click(apply);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(filledCosts));
  });

  it('closes via the Cancel button', async () => {
    const { getByRole, onClose } = setup();
    await userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes via the close icon', async () => {
    const { getByRole, onClose } = setup();
    await userEvent.click(getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });
});
