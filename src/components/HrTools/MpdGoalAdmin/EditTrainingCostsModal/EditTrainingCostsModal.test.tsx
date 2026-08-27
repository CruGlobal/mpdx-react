import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { TrainingCosts } from '../mpdGoalAdminHelpers';
import { EditTrainingCostsModal } from './EditTrainingCostsModal';

const onClose = jest.fn();
const onSave = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const filledCosts: TrainingCosts = {
  nsoIndividual1InRoom: 100,
  nsoIndividual2InRoom: 200,
  nsoCouple: 300,
  nsoFamily: 400,
  ibsSingle: 500,
  ibsCouple: 600,
  refreshRetreatSingle: 700,
  refreshRetreatCouple: 800,
  faithAndFinanceSingle: 900,
  faithAndFinanceCouple: 1000,
  cruConferenceSingle: 1100,
  cruConferenceCouple: 1200,
  cruConferenceFamily: 1300,
};

/** Fields keyed by (section, label) since labels repeat across sections. */
const fieldsBySection: {
  title: string;
  fields: { label: string; value: number }[];
}[] = [
  {
    title: 'NSO Cost',
    fields: [
      {
        label: 'Individual (1 in room)',
        value: filledCosts.nsoIndividual1InRoom,
      },
      {
        label: 'Individual (2 in room)',
        value: filledCosts.nsoIndividual2InRoom,
      },
      { label: 'Couple', value: filledCosts.nsoCouple },
      { label: 'Family', value: filledCosts.nsoFamily },
    ],
  },
  {
    title: 'IBS Cost',
    fields: [
      { label: 'Single', value: filledCosts.ibsSingle },
      { label: 'Couple', value: filledCosts.ibsCouple },
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

/** Scopes the label lookup to its section so repeated labels stay unambiguous. */
const inputForField = (
  getByRole: ReturnType<typeof render>['getByRole'],
  sectionTitle: string,
  label: string,
): HTMLElement => {
  const container = getByRole('heading', { name: sectionTitle })
    .parentElement as HTMLElement;
  return within(container).getByRole('spinbutton', { name: label });
};

const TestComponent: React.FC<
  Partial<React.ComponentProps<typeof EditTrainingCostsModal>>
> = (overrides) => (
  <ThemeProvider theme={theme}>
    <EditTrainingCostsModal
      open
      cohortName="Fall NSO 2026"
      onClose={onClose}
      onSave={onSave}
      {...overrides}
    />
  </ThemeProvider>
);

describe('EditTrainingCostsModal', () => {
  it('renders the cohort-specific title, subtitle and every section in order', () => {
    const { getByText, getByRole, getAllByRole } = render(<TestComponent />);
    expect(
      getByRole('heading', { name: 'Training Costs for Fall NSO 2026' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        'Please enter the cost details that apply to this training. All fields are required.',
      ),
    ).toBeInTheDocument();
    // NSO and IBS being distinct and in this order is the point of the layout.
    expect(
      getAllByRole('heading', { level: 3 }).map(
        (heading) => heading.textContent,
      ),
    ).toEqual(fieldsBySection.map((section) => section.title));
  });

  it('falls back to a generic title when no cohort name is given', () => {
    const { getByRole } = render(<TestComponent cohortName={undefined} />);
    expect(
      getByRole('heading', { name: 'Training Costs' }),
    ).toBeInTheDocument();
  });

  it('renders all thirteen cost inputs, initially blank', () => {
    const { getAllByRole } = render(<TestComponent />);
    const inputs = getAllByRole('spinbutton');
    expect(inputs).toHaveLength(13);
    inputs.forEach((input) => expect(input).toHaveValue(null));
  });

  it('prefills the inputs from initialCosts', () => {
    const { getByRole } = render(<TestComponent initialCosts={filledCosts} />);
    // By (section, label) identity, so a bad mapping can't pass positionally.
    fieldsBySection.forEach(({ title, fields }) => {
      fields.forEach(({ label, value }) => {
        expect(inputForField(getByRole, title, label)).toHaveValue(value);
      });
    });
  });

  it('disables Apply until every field is valid', async () => {
    const { getByRole, getAllByRole } = render(<TestComponent />);
    const apply = getByRole('button', { name: 'Apply' });
    expect(apply).toBeDisabled();

    const inputs = getAllByRole('spinbutton');
    for (let i = 0; i < inputs.length; i++) {
      await userEvent.type(inputs[i], String((i + 1) * 100));
    }

    await waitFor(() => expect(apply).toBeEnabled());
  });

  it('surfaces a validation error and keeps Apply disabled for a negative amount', async () => {
    const { getByRole, getAllByRole, findByText } = render(<TestComponent />);
    const inputs = getAllByRole('spinbutton');

    // Enter a negative amount in the first field and valid amounts elsewhere.
    await userEvent.type(inputs[0], '-5');
    for (let i = 1; i < inputs.length; i++) {
      await userEvent.type(inputs[i], String((i + 1) * 100));
    }
    // Blur the last field so every field is touched and validation has run.
    await userEvent.tab();

    expect(await findByText('Amount must be 0 or more')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('keeps Apply disabled when a required field is left blank', async () => {
    const { getByRole, getAllByRole } = render(<TestComponent />);
    const inputs = getAllByRole('spinbutton');

    // Fill every field except the first, which stays blank.
    for (let i = 1; i < inputs.length; i++) {
      await userEvent.type(inputs[i], String((i + 1) * 100));
    }

    expect(getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('saves parsed numeric costs when applied', async () => {
    const { getByRole } = render(<TestComponent />);
    // By identity, so onSave receiving filledCosts proves each label's mapping.
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
    // Typing all thirteen fields exceeds the default 5s timeout under load.
  }, 20000);

  it('closes via the Cancel button', async () => {
    const { getByRole } = render(<TestComponent />);
    await userEvent.click(getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes via the close icon', async () => {
    const { getByRole } = render(<TestComponent />);
    await userEvent.click(getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });
});
