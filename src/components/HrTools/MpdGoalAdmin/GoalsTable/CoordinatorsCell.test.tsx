import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { CoordinatorsCell } from './CoordinatorsCell';

const renderCell = (coordinators: string[]) =>
  render(
    <ThemeProvider theme={theme}>
      <CoordinatorsCell coordinators={coordinators} />
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

    userEvent.click(getByRole('button', { name: 'Show all 3 coordinators' }));

    expect(getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
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

    userEvent.click(getByRole('button', { name: 'Show all 2 coordinators' }));
    expect(getByRole('menu')).toBeInTheDocument();

    userEvent.type(getByRole('menu'), '{esc}');

    expect(queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders nothing when the attendee has no coordinators', () => {
    const { container } = renderCell([]);

    expect(container).toBeEmptyDOMElement();
  });
});
