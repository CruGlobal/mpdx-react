import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { mockData } from '../mockData';
import { PrintTable } from './PrintTable';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <PrintTable data={mockData} />
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('PrintTable', () => {
  it('should render with the correct data', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    expect(
      getByRole('columnheader', { name: 'Ministry Partner' }),
    ).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Last Gift' }),
    ).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Last Reminder' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();

    expect(
      await findByRole('cell', { name: /Adamson, Eugene Michael/ }),
    ).toBeInTheDocument();

    expect(
      await findByRole('cell', { name: 'Aug 13, 2025' }),
    ).toBeInTheDocument();
  });
});
