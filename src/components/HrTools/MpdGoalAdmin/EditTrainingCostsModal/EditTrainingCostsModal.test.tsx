import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
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

/**
 * Every cost field grouped by its section, tied to its value in `filledCosts`
 * by field identity rather than DOM position. Labels like "Couple"/"Single"/
 * "Family" repeat across sections, so fields are located by looking them up
 * within their section heading's container instead of by a flat positional
 * index — reordering a field can no longer silently remap it to a wrong value.
 */
const fieldsBySection: {
  title: string;
  fields: { label: string; value: number }[];
}[] = [
  {
    title: 'NSO & IBS Cost',
    fields: [
      {
        label: 'Individual (1 in room)',
        value: filledCosts.nsoIbsIndividual1InRoom,
      },
      {
        label: 'Individual (2 in room)',
        value: filledCosts.nsoIbsIndividual2InRoom,
      },
      { label: 'Couple', value: filledCosts.nsoIbsCouple },
      { label: 'Family', value: filledCosts.nsoIbsFamily },
    ],
  },
  {
    title: 'Refresh Retreat',
    fields: [
      { label: 'Single', value: filledCosts.refreshRetreatSingle },
      { label: 'Couple', value: filledCosts.refreshRetreatCouple },
    ],
  },
  {
    title: 'Faith and Finance',
    fields: [
      { label: 'Single', value: filledCosts.faithAndFinanceSingle },
      { label: 'Couple', value: filledCosts.faithAndFinanceCouple },
    ],
  },
  {
    title: 'Cru Conference',
    fields: [
      { label: 'Single', value: filledCosts.cruConferenceSingle },
      { label: 'Couple', value: filledCosts.cruConferenceCouple },
      { label: 'Family', value: filledCosts.cruConferenceFamily },
    ],
  },
];

/**
 * Resolves a cost input by its (section, label) identity. Scopes the label
 * lookup to the section's container so repeated labels stay unambiguous.
 */
const inputForField = (
  getByRole: ReturnType<typeof setup>['getByRole'],
  sectionTitle: string,
  label: string,
): HTMLElement => {
  const container = getByRole('heading', { name: sectionTitle })
    .parentElement as HTMLElement;
  return within(container).getByRole('spinbutton', { name: label });
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
    const { getByRole } = setup({ initialCosts: filledCosts });
    // Assert each field by its (section, label) identity so a mismatched
    // prefill mapping surfaces on the specific field rather than passing by
    // positional coincidence.
    fieldsBySection.forEach(({ title, fields }) => {
      fields.forEach(({ label, value }) => {
        expect(inputForField(getByRole, title, label)).toHaveValue(value);
      });
    });
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
    const { getByRole, onSave } = setup();
    // Fill each field by its (section, label) identity rather than a flat
    // positional index, so `onSave` receiving `filledCosts` genuinely proves
    // each labelled input maps to its intended cost key.
    for (const { title, fields } of fieldsBySection) {
      for (const { label, value } of fields) {
        await userEvent.type(
          inputForField(getByRole, title, label),
          String(value),
        );
      }
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
