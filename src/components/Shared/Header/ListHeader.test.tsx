import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';

import { ListHeader, ListHeaderCheckBoxState } from './ListHeader';

const toggleFilterPanel = jest.fn();
const onSearchTermChanged = jest.fn();
const onCheckAllItems = jest.fn();
const toggleStarredFilter = jest.fn();

describe('ListHeader', () => {
  describe('Contact', () => {
    it('renders contact header', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider theme={theme}>
          <ListHeader
            page="contact"
            activeFilters={false}
            starredFilter={{}}
            toggleStarredFilter={toggleStarredFilter}
            headerCheckboxState={ListHeaderCheckBoxState.unchecked}
            filterPanelOpen={false}
            toggleFilterPanel={toggleFilterPanel}
            onCheckAllItems={onCheckAllItems}
            onSearchTermChanged={onSearchTermChanged}
          />
        </ThemeProvider>,
      );

      expect(getByPlaceholderText('Search List')).toBeInTheDocument();
    });
  });

  describe('Task', () => {
    it('renders task header', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider theme={theme}>
          <ListHeader
            page="task"
            activeFilters={false}
            headerCheckboxState={ListHeaderCheckBoxState.unchecked}
            starredFilter={{}}
            toggleStarredFilter={toggleStarredFilter}
            filterPanelOpen={false}
            toggleFilterPanel={toggleFilterPanel}
            onCheckAllItems={onCheckAllItems}
            onSearchTermChanged={onSearchTermChanged}
          />
        </ThemeProvider>,
      );

      expect(getByPlaceholderText('Search Tasks')).toBeVisible();
    });
  });

  it('checkbox is unchecked', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
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
    const onCheckAllItems = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );

    const checkbox = getByRole('checkbox');
    userEvent.click(checkbox);
    expect(onCheckAllItems).toHaveBeenCalled();
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('filters button displays for no filters', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
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
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={true}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
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
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
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
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={true}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
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
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
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
    const searchText = 'name';

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
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
