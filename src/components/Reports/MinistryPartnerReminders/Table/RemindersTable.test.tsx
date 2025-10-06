import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { mockData } from '../mockData';
import { RemindersTable } from './RemindersTable';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <RemindersTable data={mockData} />
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('RemindersTable', () => {
  it('should render with the correct data', () => {
    const { getByRole, getAllByRole } = render(<TestComponent />);

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

    expect(
      getByRole('cell', {
        name: 'Adamson, Eugene Michael (Mike) and Marilyn Jean',
      }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Aug 13, 2025' })).toBeInTheDocument();

    const select = getAllByRole('combobox', { name: /reminder status/i });
    expect(select[0]).toBeInTheDocument();
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
});
