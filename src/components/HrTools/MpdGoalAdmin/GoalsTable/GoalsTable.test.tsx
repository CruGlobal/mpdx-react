import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { mockCohorts } from '../mockData';
import { GoalsTable } from './GoalsTable';

const rows = mockCohorts[0].rows;

let ctx: ReturnType<typeof useMpdGoalAdmin>;
const Capture: React.FC<{ rows: (typeof mockCohorts)[0]['rows'] }> = ({
  rows,
}) => {
  ctx = useMpdGoalAdmin();
  return <GoalsTable rows={rows} />;
};

const renderTable = (data = rows) =>
  render(
    <ThemeProvider theme={theme}>
      <MpdGoalAdminProvider>
        <Capture rows={data} />
      </MpdGoalAdminProvider>
    </ThemeProvider>,
  );

describe('GoalsTable', () => {
  it('renders a row per staff member with a formatted goal', () => {
    const { getByText, getAllByRole } = renderTable();
    expect(getByText('John & Jane Doe')).toBeInTheDocument();
    expect(getByText('$6,430.25')).toBeInTheDocument();
    // header row + 5 data rows
    expect(getAllByRole('row')).toHaveLength(rows.length + 1);
  });

  it('renders an empty placeholder for zero rows', () => {
    const { getByText } = renderTable([]);
    expect(getByText('No goals found')).toBeInTheDocument();
  });

  it('shows an Assign Coach prompt when no coach is set', () => {
    const { getByText } = renderTable();
    expect(getByText('Assign Coach')).toBeInTheDocument();
  });

  it('selects a row via its checkbox', async () => {
    const { getAllByRole } = renderTable();
    // index 0 is the header "select all" checkbox
    await userEvent.click(getAllByRole('checkbox')[1]);
    expect(ctx.selectedRowIds.has('row-1')).toBe(true);
  });

  it('opens the drawer when a name is clicked', async () => {
    const { getByText } = renderTable();
    await userEvent.click(getByText('John & Jane Doe'));
    expect(ctx.openMember?.id).toBe('row-1');
  });
});
