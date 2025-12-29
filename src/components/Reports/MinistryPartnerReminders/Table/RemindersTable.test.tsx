import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { VirtuosoMockContext } from 'react-virtuoso';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { mockData } from '../mockData';
import { RemindersTable, RowValues } from './RemindersTable';

const onSubmit = jest.fn();
const mutationSpy = jest.fn();

const initialValues: RowValues = {
  status: Object.fromEntries(mockData.map((row) => [row.id, row.status])),
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <VirtuosoMockContext.Provider
      value={{ viewportHeight: 300, itemHeight: 100 }}
    >
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <GqlMockedProvider onCall={mutationSpy}>
          <Formik<RowValues> initialValues={initialValues} onSubmit={onSubmit}>
            <RemindersTable data={mockData} />
          </Formik>
        </GqlMockedProvider>
      </LocalizationProvider>
    </VirtuosoMockContext.Provider>
  </ThemeProvider>
);

describe('RemindersTable', () => {
  it('should render with the correct data', async () => {
    const { findByRole, getByRole, getAllByRole } = render(<TestComponent />);

    expect(
      getByRole('columnheader', { name: 'Ministry Partner' }),
    ).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Last Gift' }),
    ).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Last Reminder' }),
    ).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Reminder Status' }),
    ).toBeInTheDocument();

    const cells = within(await findByRole('table')).getAllByRole('cell');
    const partner = cells.find((cell) =>
      within(cell).queryByText(
        'Adamson, Eugene Michael (Mike) and Marilyn Jean',
      ),
    );
    expect(partner).toBeTruthy();

    const date = cells.find((cell) => within(cell).queryByText('Aug 13, 2025'));
    expect(date).toBeTruthy();

    const select = getAllByRole('combobox', { name: /reminder status/i });
    expect(select[0]).toHaveTextContent('Not Reminded');
  });

  it('should change the select value', async () => {
    const { getAllByRole, getByRole } = render(<TestComponent />);

    const select = getAllByRole('combobox', { name: /reminder status/i });
    expect(select[0]).toHaveTextContent('Not Reminded');

    await userEvent.click(select[0]);
    const option = getByRole('option', { name: 'Monthly' });
    expect(option).toBeInTheDocument();

    await userEvent.click(option);
    expect(select[0]).toHaveTextContent('Monthly');
  });

  it('should render empty table message when no data available', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <VirtuosoMockContext.Provider
          value={{ viewportHeight: 300, itemHeight: 100 }}
        >
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <GqlMockedProvider onCall={mutationSpy}>
              <RemindersTable data={[]} />
            </GqlMockedProvider>
          </LocalizationProvider>
        </VirtuosoMockContext.Provider>
      </ThemeProvider>,
    );

    expect(getByText('No ministry partners to display')).toBeInTheDocument();
    expect(
      getByText('Add a ministry partner to get started'),
    ).toBeInTheDocument();
  });
});
