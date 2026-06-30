import { ThemeProvider } from '@mui/material/styles';
import { act, render } from '@testing-library/react';
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

  it('selects every row on the page via the header checkbox', async () => {
    const { getAllByRole } = renderTable();
    // index 0 is the header "select all" checkbox
    await userEvent.click(getAllByRole('checkbox')[0]);
    rows.forEach((row) => {
      expect(ctx.selectedRowIds.has(row.id)).toBe(true);
    });
  });

  it('shows the header checkbox as indeterminate when only some rows are selected', async () => {
    const { getAllByRole } = renderTable();
    const checkboxes = getAllByRole('checkbox');
    const headerCheckbox = checkboxes[0] as HTMLInputElement;

    // Nothing selected yet: neither checked nor indeterminate.
    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox).toHaveAttribute('data-indeterminate', 'false');

    // Select a single data row.
    await userEvent.click(checkboxes[1]);
    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox).toHaveAttribute('data-indeterminate', 'true');

    // Select the rest via the header, which now reads "select all".
    await userEvent.click(headerCheckbox);
    expect(headerCheckbox.checked).toBe(true);
    expect(headerCheckbox).toHaveAttribute('data-indeterminate', 'false');
  });

  it('paginates: only the first page of rows is shown at a time', () => {
    // 12 rows with the default page size of 10 forces a second page.
    const manyRows = Array.from({ length: 12 }, (_index, i) => ({
      ...rows[0],
      id: `page-row-${i}`,
      name: `Person ${i}`,
    }));
    const { getByText, queryByText } = renderTable(manyRows);
    expect(getByText('Person 0')).toBeInTheDocument();
    expect(getByText('Person 9')).toBeInTheDocument();
    // Person 10 and 11 are on page 2, not rendered yet.
    expect(queryByText('Person 10')).not.toBeInTheDocument();
    expect(queryByText('Person 11')).not.toBeInTheDocument();
  });

  it('returns to the first page when the filter changes', async () => {
    const manyRows = Array.from({ length: 12 }, (_index, i) => ({
      ...rows[0],
      id: `page-row-${i}`,
      name: `Person ${i}`,
    }));
    const { getByText, getByRole, queryByText, rerender } = render(
      <ThemeProvider theme={theme}>
        <MpdGoalAdminProvider>
          <Capture rows={manyRows} />
        </MpdGoalAdminProvider>
      </ThemeProvider>,
    );
    // Verify page 1 is rendered first.
    expect(getByText('Person 9')).toBeInTheDocument();
    // Advance to the next page via the pagination "next page" button.
    await userEvent.click(getByRole('button', { name: /Go to next page/i }));
    expect(getByText('Person 10')).toBeInTheDocument();

    // Changing the filter shrinks the result set. The table must reset to the
    // first page rather than stranding the user on a now-out-of-range page.
    act(() => {
      ctx.setSearch('Person 0');
    });
    rerender(
      <ThemeProvider theme={theme}>
        <MpdGoalAdminProvider>
          <Capture rows={[manyRows[0]]} />
        </MpdGoalAdminProvider>
      </ThemeProvider>,
    );
    expect(getByText('Person 0')).toBeInTheDocument();
    expect(queryByText('Person 10')).not.toBeInTheDocument();
  });
});
