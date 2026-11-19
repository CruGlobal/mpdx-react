import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { ScrollableTableContainer } from './ScrollableTableContainer';

describe('ScrollableTableContainer', () => {
  it('renders the scroll hint and the table', () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <ScrollableTableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Appointments</TableCell>
                <TableCell>4</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollableTableContainer>
      </ThemeProvider>,
    );

    expect(
      getByText('Scroll sideways to see more columns.'),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Appointments' })).toBeInTheDocument();
  });
});
