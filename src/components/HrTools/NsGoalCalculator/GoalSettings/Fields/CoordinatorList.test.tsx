import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { CoordinatorList } from './CoordinatorList';

const renderList = (coordinators: string[]) =>
  render(
    <ThemeProvider theme={theme}>
      <CoordinatorList coordinators={coordinators} />
    </ThemeProvider>,
  );

describe('CoordinatorList', () => {
  it('lists every coordinator under a heading', () => {
    const { getByRole, getByText } = renderList([
      'Nancy Coleman',
      'Francis Powell',
      'Gerald Christianson',
    ]);

    expect(getByText('Coordinators')).toBeInTheDocument();
    expect(getByRole('list', { name: 'Coordinators' }).textContent).toBe(
      'Nancy ColemanFrancis PowellGerald Christianson',
    );
  });

  it('keeps the plural heading for a single coordinator', () => {
    const { getByText } = renderList(['Nancy Coleman']);

    expect(getByText('Coordinators')).toBeInTheDocument();
    expect(getByText('Nancy Coleman')).toBeInTheDocument();
  });

  it('renders nothing when no coordinator is assigned', () => {
    const { container } = renderList([]);

    expect(container).toBeEmptyDOMElement();
  });
});
