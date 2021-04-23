import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import { ContactsHeader } from './ContactsHeader';

describe('ContactFilters', () => {
  it('checkbox is unchecked', async () => {
    const theme = createMuiTheme({
      props: { MuiWithWidth: { initialWidth: 'md' } },
    });

    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={false}
          toggleFilterPanel={() => {}}
        />
        ,
      </MuiThemeProvider>,
    );

    const checkbox = getByRole('checkbox');

    await userEvent.click(checkbox);

    expect(checkbox.getAttribute('class')).toEqual('PrivateSwitchBase-input-9');
  });

  it('checkbox is checked', async () => {
    const theme = createMuiTheme({
      props: { MuiWithWidth: { initialWidth: 'md' } },
    });

    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={false}
          toggleFilterPanel={() => {}}
        />
        ,
      </MuiThemeProvider>,
    );

    const checkbox = getByRole('checkbox');

    await userEvent.click(checkbox);

    expect(checkbox.getAttribute('class')).toEqual(
      'PrivateSwitchBase-input-37',
    );
  });

  it('filters button displays for no filters', async () => {
    const theme = createMuiTheme({
      props: { MuiWithWidth: { initialWidth: 'md' } },
    });

    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={false}
          toggleFilterPanel={() => {}}
        />
        ,
      </MuiThemeProvider>,
    );

    const filterButton = getByRole('FilterButton');
    const style = window.getComputedStyle(filterButton);

    expect(style.backgroundColor).toMatchInlineSnapshot(`"transparent"`);
  });

  it('filters button displays for open filter panel', async () => {
    const theme = createMuiTheme({
      props: { MuiWithWidth: { initialWidth: 'md' } },
    });

    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={true}
          toggleFilterPanel={() => {}}
        />
        ,
      </MuiThemeProvider>,
    );

    const filterButton = getByRole('FilterButton');
    const style = window.getComputedStyle(filterButton);

    expect(style.backgroundColor).toMatchInlineSnapshot(`"rgb(156, 159, 161)"`);
  });

  it('filters button displays for active filters', async () => {
    const theme = createMuiTheme({
      props: { MuiWithWidth: { initialWidth: 'md' } },
    });

    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={true}
          filterPanelOpen={false}
          toggleFilterPanel={() => {}}
        />
        ,
      </MuiThemeProvider>,
    );

    const filterButton = getByRole('FilterButton');
    const style = window.getComputedStyle(filterButton);

    expect(style.backgroundColor).toMatchInlineSnapshot(`"rgb(255, 207, 7)"`);
  });

  it('filters button displays for active filters and filter panel open', async () => {
    const theme = createMuiTheme({
      props: { MuiWithWidth: { initialWidth: 'md' } },
    });

    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={true}
          filterPanelOpen={false}
          toggleFilterPanel={() => {}}
        />
        ,
      </MuiThemeProvider>,
    );

    const filterButton = getByRole('FilterButton');
    const style = window.getComputedStyle(filterButton);

    expect(style.backgroundColor).toMatchInlineSnapshot(`"rgb(255, 207, 7)"`);
  });
});
