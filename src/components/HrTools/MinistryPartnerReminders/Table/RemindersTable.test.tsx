import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { VirtuosoMockContext } from 'react-virtuoso';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ReminderData, mockData } from '../mockData';
import { RemindersTable, RowValues } from './RemindersTable';

const onSubmit = jest.fn();
const mutationSpy = jest.fn();

const TestComponent: React.FC<{ data?: ReminderData[] }> = ({
  data = mockData,
}) => (
  <ThemeProvider theme={theme}>
    <VirtuosoMockContext.Provider
      value={{ viewportHeight: 300, itemHeight: 100 }}
    >
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <GqlMockedProvider onCall={mutationSpy}>
          <Formik<RowValues>
            initialValues={{
              status: Object.fromEntries(
                data.map((row) => [row.id, row.status]),
              ),
            }}
            onSubmit={onSubmit}
          >
            <RemindersTable data={data} />
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
    expect(select[0]).toHaveTextContent('None');
  });

  describe('dates in the partner cell', () => {
    const partnerName = 'Adamson, Eugene Michael (Mike) and Marilyn Jean';

    it('renders the last gift and skips a missing last reminder', async () => {
      const { findByText } = render(<TestComponent />);

      const partner = (await findByText(partnerName)).closest(
        'td',
      ) as HTMLElement;
      expect(
        within(partner).getByText('Last Gift: Aug 13, 2025'),
      ).toBeInTheDocument();
      expect(
        within(partner).queryByText(/Last Reminder:/),
      ).not.toBeInTheDocument();
    });

    it('renders the last reminder and skips a missing last gift', async () => {
      const { findByText } = render(
        <TestComponent
          data={[
            {
              ...mockData[0],
              lastGift: null,
              lastReminder: DateTime.fromISO('2025-09-01'),
            },
          ]}
        />,
      );

      const partner = (await findByText(partnerName)).closest(
        'td',
      ) as HTMLElement;
      expect(
        within(partner).getByText('Last Reminder: Sep 1, 2025'),
      ).toBeInTheDocument();
      expect(within(partner).queryByText(/Last Gift:/)).not.toBeInTheDocument();
    });
  });

  it('should change the select value', async () => {
    const { getAllByRole, getByRole } = render(<TestComponent />);

    const select = getAllByRole('combobox', { name: /reminder status/i });
    expect(select[0]).toHaveTextContent('None');

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

    expect(getByText('No ministry partners found')).toBeInTheDocument();
    expect(
      getByText('Add a ministry partner to get started'),
    ).toBeInTheDocument();
  });

  it('should render no designation account message when there is no designation', () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <VirtuosoMockContext.Provider
          value={{ viewportHeight: 300, itemHeight: 100 }}
        >
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <GqlMockedProvider onCall={mutationSpy}>
              <RemindersTable data={[]} noDesignation />
            </GqlMockedProvider>
          </LocalizationProvider>
        </VirtuosoMockContext.Provider>
      </ThemeProvider>,
    );

    expect(getByText('No designation account found')).toBeInTheDocument();
    expect(
      getByText(
        /This account is not associated with a designation account number/,
      ),
    ).toBeInTheDocument();
    expect(getByRole('link', { name: 'HR@cru.org' })).toHaveAttribute(
      'href',
      'mailto:HR@cru.org',
    );
  });
});
