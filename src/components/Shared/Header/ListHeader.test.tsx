import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';

import useTaskModal from '../../../hooks/useTaskModal';
import {
  ListHeader,
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from './ListHeader';

const toggleFilterPanel = jest.fn();
const onSearchTermChanged = jest.fn();
const onCheckAllItems = jest.fn();
const toggleStarredFilter = jest.fn();
const selectedIds: string[] = [];

jest.mock('../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
});

describe('ListHeader', () => {
  describe('Contact', () => {
    it('renders contact header', () => {
      const { getByPlaceholderText, getByTestId, getByText } = render(
        <ThemeProvider theme={theme}>
          <ListHeader
            selectedIds={selectedIds}
            page="contact"
            activeFilters={false}
            starredFilter={{}}
            toggleStarredFilter={toggleStarredFilter}
            headerCheckboxState={ListHeaderCheckBoxState.unchecked}
            filterPanelOpen={false}
            contactDetailsOpen={false}
            toggleFilterPanel={toggleFilterPanel}
            onCheckAllItems={onCheckAllItems}
            onSearchTermChanged={onSearchTermChanged}
          />
        </ThemeProvider>,
      );

      expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
      expect(getByText('Actions')).toBeInTheDocument();
      expect(getByTestId('star-filter-button')).toBeInTheDocument();
      expect(getByTestId('showing-text')).toBeInTheDocument();
    });

    it('renders contact header with contact card open', () => {
      const { getByPlaceholderText, queryByTestId, queryByText } = render(
        <ThemeProvider theme={theme}>
          <ListHeader
            selectedIds={selectedIds}
            page="contact"
            activeFilters={false}
            starredFilter={{}}
            contactsView={TableViewModeEnum.List}
            toggleStarredFilter={toggleStarredFilter}
            headerCheckboxState={ListHeaderCheckBoxState.unchecked}
            filterPanelOpen={true}
            contactDetailsOpen={true}
            toggleFilterPanel={toggleFilterPanel}
            onCheckAllItems={onCheckAllItems}
            onSearchTermChanged={onSearchTermChanged}
          />
        </ThemeProvider>,
      );

      expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
      expect(queryByText('Actions')).not.toBeInTheDocument();
      expect(queryByTestId('star-filter-button')).not.toBeInTheDocument();
    });
  });

  it('opens the more actions menu and clicks the add task action', () => {
    const {
      getByPlaceholderText,
      getByTestId,
      getByText,
      queryByText,
    } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Add Task')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Add Task')).toBeInTheDocument();
    userEvent.click(getByText('Add Task'));
    expect(openTaskModal).toHaveBeenCalledWith({
      defaultValues: { contactIds: selectedIds },
    });
    expect(getByTestId('star-filter-button')).toBeInTheDocument();
    expect(getByTestId('showing-text')).toBeInTheDocument();
  });

  describe('Task', () => {
    it('renders task header', () => {
      const { getByPlaceholderText } = render(
        <ThemeProvider theme={theme}>
          <ListHeader
            selectedIds={selectedIds}
            page="task"
            activeFilters={false}
            headerCheckboxState={ListHeaderCheckBoxState.unchecked}
            starredFilter={{}}
            toggleStarredFilter={toggleStarredFilter}
            filterPanelOpen={false}
            contactDetailsOpen={false}
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
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          contactDetailsOpen={false}
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
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          contactDetailsOpen={false}
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
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          contactDetailsOpen={false}
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
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={true}
          contactDetailsOpen={false}
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
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          contactDetailsOpen={false}
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
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={true}
          contactDetailsOpen={false}
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
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          contactDetailsOpen={false}
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
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );
    const textbox = getByRole('textbox');

    userEvent.type(textbox, searchText);

    expect(toggleFilterPanel).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(onSearchTermChanged).toHaveBeenCalledWith(searchText);
  });

  it('press star filter button and set to true', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );
    const starFilterButton = getByTestId('star-filter-button');

    userEvent.click(starFilterButton);

    expect(toggleStarredFilter).toHaveBeenCalledWith({ starred: true });
  });

  it('reset the star filter', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{ starred: true }}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );
    const starFilterButton = getByTestId('star-filter-button');

    userEvent.click(starFilterButton);

    expect(toggleStarredFilter).toHaveBeenCalledWith({});
  });

  it('renders the total count', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{ starred: true }}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          contactsView={TableViewModeEnum.List}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );
    expect(getByText('Showing {{count}}')).toBeInTheDocument();
  });

  it('does not renders the total count', async () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          contactsView={TableViewModeEnum.Flows}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{ starred: true }}
          toggleStarredFilter={toggleStarredFilter}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
        />
      </ThemeProvider>,
    );
    expect(queryByText('Showing {{count}}')).not.toBeInTheDocument();
  });
});
