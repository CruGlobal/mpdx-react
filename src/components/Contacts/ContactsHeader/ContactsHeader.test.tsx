import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';
import { ContactsHeader } from './ContactsHeader';

describe('ContactsHeader', () => {
  it('checkbox is unchecked', async () => {
    const toggleFilterPanel = jest.fn();
    const onSearchTermChanged = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );

    const checkbox = getByRole('checkbox');

    userEvent.click(checkbox);
    userEvent.click(checkbox);

    expect(checkbox).toHaveProperty('checked', false);
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('checkbox is checked', async () => {
    const toggleFilterPanel = jest.fn();
    const onSearchTermChanged = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );

    const checkbox = getByRole('checkbox');

    userEvent.click(checkbox);

    expect(checkbox).toHaveProperty('checked', true);
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('filters button displays for no filters', async () => {
    const toggleFilterPanel = jest.fn();
    const onSearchTermChanged = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });

    expect(filterButton).toHaveStyle({ backgroundColor: 'transparent' });
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it.skip('filters button displays for open filter panel', async () => {
    const toggleFilterPanel = jest.fn();
    const onSearchTermChanged = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={true}
          toggleFilterPanel={toggleFilterPanel}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });

    expect(filterButton).toHaveStyle({
      backgroundColor: theme.palette.secondary.dark,
    });
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it.skip('filters button displays for active filters', async () => {
    const toggleFilterPanel = jest.fn();
    const onSearchTermChanged = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={true}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });

    expect(filterButton).toHaveStyle({
      backgroundColor: theme.palette.cruYellow.main,
    });
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it.skip('filters button displays for active filters and filter panel open', async () => {
    const toggleFilterPanel = jest.fn();
    const onSearchTermChanged = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={true}
          filterPanelOpen={true}
          toggleFilterPanel={toggleFilterPanel}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });

    expect(filterButton).toHaveStyle({
      backgroundColor: theme.palette.cruYellow.main,
    });
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('filters button pressed', async () => {
    const toggleFilterPanel = jest.fn();
    const onSearchTermChanged = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={false}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });

    userEvent.click(filterButton);

    expect(toggleFilterPanel).toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('search text changed', async () => {
    const toggleFilterPanel = jest.fn();
    const onSearchTermChanged = jest.fn();
    const searchText = 'name';

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ContactsHeader
          activeFilters={true}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );
    const textbox = getByRole('textbox');

    userEvent.type(textbox, searchText);

    expect(toggleFilterPanel).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(onSearchTermChanged).toHaveBeenCalledWith(searchText);
  });
});
