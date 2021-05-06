import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';
import { ContactsHeader } from './ContactsHeader';

describe('ContactFilters', () => {
  it('checkbox is unchecked', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={false}
          toggleFilterPanel={() => {}}
          onSearchTermChanged={() => {}}
        />
      </ThemeProvider>,
    );

    const checkbox = getByRole('checkbox');

    await userEvent.click(checkbox);
    await userEvent.click(checkbox);

    expect(checkbox).toHaveProperty('checked', false);
  });

  it('checkbox is checked', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={false}
          toggleFilterPanel={() => {}}
          onSearchTermChanged={() => {}}
        />
      </ThemeProvider>,
    );

    const checkbox = getByRole('checkbox');

    await userEvent.click(checkbox);

    expect(checkbox).toHaveProperty('checked', true);
  });

  it('filters button displays for no filters', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={false}
          toggleFilterPanel={() => {}}
          onSearchTermChanged={() => {}}
        />
      </ThemeProvider>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });
    const style = window.getComputedStyle(filterButton);

    expect(style.backgroundColor).toMatchInlineSnapshot(`"transparent"`);
  });

  it('filters button displays for open filter panel', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={true}
          toggleFilterPanel={() => {}}
          onSearchTermChanged={() => {}}
        />
      </ThemeProvider>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });
    const style = window.getComputedStyle(filterButton);

    expect(style.backgroundColor).toMatchInlineSnapshot(`"rgb(156, 159, 161)"`);
  });

  it('filters button displays for active filters', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={true}
          filterPanelOpen={false}
          toggleFilterPanel={() => {}}
          onSearchTermChanged={() => {}}
        />
      </ThemeProvider>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });
    const style = window.getComputedStyle(filterButton);

    expect(style.backgroundColor).toMatchInlineSnapshot(`"rgb(255, 207, 7)"`);
  });

  it('filters button displays for active filters and filter panel open', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={true}
          filterPanelOpen={false}
          toggleFilterPanel={() => {}}
          onSearchTermChanged={() => {}}
        />
      </ThemeProvider>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });
    const style = window.getComputedStyle(filterButton);

    expect(style.backgroundColor).toMatchInlineSnapshot(`"rgb(255, 207, 7)"`);
  });
});
