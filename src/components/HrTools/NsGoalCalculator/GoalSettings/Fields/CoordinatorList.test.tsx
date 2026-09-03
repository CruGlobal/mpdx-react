import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
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
    const { getByRole } = renderList([
      'Nancy Coleman',
      'Francis Powell',
      'Gerald Christianson',
    ]);

    // Level 6 matches the person cards in the surrounding GoalSettingsHeader.
    expect(
      getByRole('heading', { level: 6, name: 'Coordinators' }),
    ).toBeInTheDocument();

    const items = within(
      getByRole('list', { name: 'Coordinators' }),
    ).getAllByRole('listitem');

    expect(items.map((item) => item.textContent)).toEqual([
      'Nancy Coleman',
      'Francis Powell',
      'Gerald Christianson',
    ]);
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
