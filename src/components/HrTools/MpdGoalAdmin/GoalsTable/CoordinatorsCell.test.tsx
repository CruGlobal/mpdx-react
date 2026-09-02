import React from 'react';
import { Table, TableBody, TableRow } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { CoordinatorsCell } from './CoordinatorsCell';

const renderCell = (coordinators: string[], staffName = 'Sam Smith') =>
  render(
    <ThemeProvider theme={theme}>
      <Table>
        <TableBody>
          <TableRow>
            <CoordinatorsCell
              coordinators={coordinators}
              staffName={staffName}
            />
          </TableRow>
        </TableBody>
      </Table>
    </ThemeProvider>,
  );

describe('CoordinatorsCell', () => {
  it('shows a lone coordinator with no overflow chip', () => {
    const { getByText, queryByRole } = renderCell(['Nancy Coleman']);

    expect(getByText('Nancy Coleman')).toBeInTheDocument();
    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the first coordinator and counts the rest in a chip', () => {
    const { getByText, queryByText } = renderCell([
      'Nancy Coleman',
      'Diana Park',
      'Ken Smith',
    ]);

    expect(getByText('Nancy Coleman')).toBeInTheDocument();
    expect(getByText('+2')).toBeInTheDocument();
    // The others stay hidden until the chip is clicked.
    expect(queryByText('Diana Park')).not.toBeInTheDocument();
  });

  it('lists every coordinator when the chip is clicked', () => {
    const { getByRole, getAllByRole } = renderCell([
      'Nancy Coleman',
      'Diana Park',
      'Ken Smith',
    ]);

    userEvent.click(
      getByRole('button', { name: '+2 more coordinators for Sam Smith' }),
    );

    expect(getByRole('list', { name: 'Coordinators' })).toBeInTheDocument();
    expect(getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Nancy Coleman',
      'Diana Park',
      'Ken Smith',
    ]);
  });

  it('closes the list on Escape', () => {
    const { getByRole, queryByRole } = renderCell([
      'Nancy Coleman',
      'Diana Park',
    ]);

    const chip = getByRole('button', {
      name: '+1 more coordinators for Sam Smith',
    });
    userEvent.click(chip);

    const list = getByRole('list', { name: 'Coordinators' });
    expect(within(list).getByText('Diana Park')).toBeInTheDocument();

    userEvent.type(list, '{esc}');

    expect(queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders a placeholder when the attendee has no coordinators', () => {
    const { getByRole } = renderCell([]);

    expect(getByRole('cell')).toHaveTextContent('—');
  });
});
