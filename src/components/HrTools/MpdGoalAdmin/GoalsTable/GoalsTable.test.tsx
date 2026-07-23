import { ThemeProvider } from '@mui/material/styles';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { mockSession } from '__tests__/util/mockSession';
import theme from 'src/theme';
import { MpdGoalAdminProvider, useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { mockCohorts } from '../mockData';
import { DEFAULT_ROWS_PER_PAGE, GoalsTable } from './GoalsTable';

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
    <SnackbarProvider>
      <TestRouter>
        <ThemeProvider theme={theme}>
          <MpdGoalAdminProvider>
            <Capture rows={data} />
          </MpdGoalAdminProvider>
        </ThemeProvider>
      </TestRouter>
    </SnackbarProvider>,
  );

describe('GoalsTable', () => {
  it('renders a row per staff member with a formatted goal', () => {
    const { getByText, getAllByRole } = renderTable();
    expect(getByText('John & Jane Doe')).toBeInTheDocument();
    expect(getByText('$6,430.25')).toBeInTheDocument();
    // header row + the first page of data rows
    expect(getAllByRole('row')).toHaveLength(
      Math.min(rows.length, DEFAULT_ROWS_PER_PAGE) + 1,
    );
  });

  it('renders an empty placeholder for zero rows', () => {
    const { getByText } = renderTable([]);
    expect(getByText('No goals found')).toBeInTheDocument();
  });

  it('shows an Assign Coach prompt when no coach is set', () => {
    const { getAllByText } = renderTable();
    expect(getAllByText('Assign Coach').length).toBeGreaterThan(0);
  });

  it('opens the Assign Coach modal for the selected staff member', async () => {
    const { getByRole, findByText } = renderTable();
    // 'Carlos & Michaela Everts' has no coach on the first page, so it renders
    // an "Assign Coach" prompt rather than a coach name.
    userEvent.click(getByRole('button', { name: 'Assign Coach' }));

    expect(
      await findByText('Assign Coach for Carlos & Michaela Everts'),
    ).toBeInTheDocument();
  });

  it('renders a View/Edit action and a menu button for each row on the page', () => {
    const { getAllByText, getAllByRole } = renderTable();
    const onPage = Math.min(rows.length, DEFAULT_ROWS_PER_PAGE);
    expect(getAllByText('View/Edit')).toHaveLength(onPage);
    expect(getAllByRole('button', { name: /Actions for/ })).toHaveLength(
      onPage,
    );
  });

  it('selects a row via its checkbox', async () => {
    const { getAllByRole } = renderTable();
    // index 0 is the header "select all" checkbox
    await userEvent.click(getAllByRole('checkbox')[1]);
    expect(ctx.selectedRowIds.has('row-1')).toBe(true);
  });

  it('selects every row on the page via the header checkbox', async () => {
    const { getAllByRole } = renderTable();
    // index 0 is the header "select all" checkbox
    await userEvent.click(getAllByRole('checkbox')[0]);
    // The header checkbox selects only the rows on the current page, not the
    // entire filtered set.
    rows.slice(0, DEFAULT_ROWS_PER_PAGE).forEach((row) => {
      expect(ctx.selectedRowIds.has(row.id)).toBe(true);
    });
    expect(ctx.selectedRowIds.size).toBe(
      Math.min(rows.length, DEFAULT_ROWS_PER_PAGE),
    );
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
    // 12 rows forces a second page at the default page size.
    const manyRows = Array.from({ length: 12 }, (_index, i) => ({
      ...rows[0],
      id: `page-row-${i}`,
      name: `Person ${i}`,
    }));
    const { getByText, queryByText } = renderTable(manyRows);
    expect(getByText('Person 0')).toBeInTheDocument();
    expect(
      getByText(`Person ${DEFAULT_ROWS_PER_PAGE - 1}`),
    ).toBeInTheDocument();
    // Rows beyond the first page are not rendered yet.
    expect(
      queryByText(`Person ${DEFAULT_ROWS_PER_PAGE}`),
    ).not.toBeInTheDocument();
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
    expect(
      getByText(`Person ${DEFAULT_ROWS_PER_PAGE - 1}`),
    ).toBeInTheDocument();
    // Advance to the next page via the pagination "next page" button.
    await userEvent.click(getByRole('button', { name: /Go to next page/i }));
    expect(getByText(`Person ${DEFAULT_ROWS_PER_PAGE}`)).toBeInTheDocument();

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
    expect(
      queryByText(`Person ${DEFAULT_ROWS_PER_PAGE}`),
    ).not.toBeInTheDocument();
  });

  describe('Impersonate action', () => {
    it('shows an Impersonate action per row for a coach', () => {
      mockSession({ coach: true, admin: false });

      const { getAllByRole } = renderTable();
      expect(getAllByRole('button', { name: 'Impersonate' })).toHaveLength(
        Math.min(rows.length, DEFAULT_ROWS_PER_PAGE),
      );
    });

    it('shows an Impersonate action per row for an admin', () => {
      mockSession({ coach: false, admin: true });

      const { getAllByRole } = renderTable();
      expect(getAllByRole('button', { name: 'Impersonate' })).toHaveLength(
        Math.min(rows.length, DEFAULT_ROWS_PER_PAGE),
      );
    });

    it('hides the Impersonate action for users without admin access', () => {
      mockSession({ coach: false, admin: false });

      const { queryByRole } = renderTable();
      expect(
        queryByRole('button', { name: 'Impersonate' }),
      ).not.toBeInTheDocument();
    });

    it('hides the Impersonate action while already impersonating', () => {
      mockSession({
        coach: true,
        admin: true,
        impersonating: true,
      });

      const { getAllByText, queryByRole } = renderTable();
      expect(
        queryByRole('button', { name: 'Impersonate' }),
      ).not.toBeInTheDocument();
      // The Actions column isn't left empty: the disabled View/Edit link
      // still renders on every row.
      const viewEditLinks = getAllByText('View/Edit');
      expect(viewEditLinks).toHaveLength(
        Math.min(rows.length, DEFAULT_ROWS_PER_PAGE),
      );
      expect(viewEditLinks[0]).toBeDisabled();
    });

    it('opens the impersonate modal for the selected staff member', async () => {
      mockSession({ coach: true, admin: false });

      const { getAllByRole, findByText } = renderTable();
      // The first Impersonate action belongs to the first row on the page.
      userEvent.click(getAllByRole('button', { name: 'Impersonate' })[0]);

      // The modal is loaded dynamically, so it appears asynchronously.
      expect(await findByText('Impersonate John & Jane Doe')).toBeVisible();
      expect(
        await findByText(
          'You are about to impersonate John & Jane Doe (john.doe@example.com). You will be logged in on their behalf and will see what they see. Provide a reason for this impersonation.',
        ),
      ).toBeVisible();
    });
  });
});
