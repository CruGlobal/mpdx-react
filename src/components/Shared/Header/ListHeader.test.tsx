import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';

import useTaskModal from '../../../hooks/useTaskModal';
import {
  ListHeader,
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from './ListHeader';
import {
  ContactsPageContext,
  ContactsPageProvider,
  ContactsPageType,
} from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';

const toggleFilterPanel = jest.fn();
const onSearchTermChanged = jest.fn();
const onCheckAllItems = jest.fn();
const toggleStarredFilter = jest.fn();
const selectedIds: string[] = ['abc'];
const openAddTagsModal = jest.fn();
const openAddToAppealModal = jest.fn();
const openCreateAppealModal = jest.fn();
const openEditFieldsModal = jest.fn();
const openHideContactsModal = jest.fn();
const openExportEmailsModal = jest.fn();
const openRemoveTagsModal = jest.fn();
const openCompleteTasksModal = jest.fn();
const openDeleteTasksModal = jest.fn();
const openEditTasksModal = jest.fn();
const openTasksRemoveTagsModal = jest.fn();
const openTasksAddTagsModal = jest.fn();

jest.mock('../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
});

const push = jest.fn();

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

const ButtonGroup: React.FC = () => {
  const { handleViewModeChange } = React.useContext(
    ContactsPageContext,
  ) as ContactsPageType;
  return (
    <>
      <Button
        data-testid="list-button"
        onClick={(event) => handleViewModeChange(event, TableViewModeEnum.List)}
      />
      <Button
        data-testid="map-button"
        onClick={(event) => handleViewModeChange(event, TableViewModeEnum.Map)}
      />
    </>
  );
};

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
            openAddToAppealModal={openAddToAppealModal}
            openEditFieldsModal={openEditFieldsModal}
            openHideContactsModal={openHideContactsModal}
            openRemoveTagsModal={openRemoveTagsModal}
            openAddTagsModal={openAddTagsModal}
            openCreateAppealModal={openCreateAppealModal}
            openExportEmailsModal={openExportEmailsModal}
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
            openAddToAppealModal={openAddToAppealModal}
            openEditFieldsModal={openEditFieldsModal}
            openHideContactsModal={openHideContactsModal}
            openRemoveTagsModal={openRemoveTagsModal}
            openAddTagsModal={openAddTagsModal}
            openCreateAppealModal={openCreateAppealModal}
            openExportEmailsModal={openExportEmailsModal}
          />
        </ThemeProvider>,
      );

      expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
      expect(queryByText('Actions')).not.toBeInTheDocument();
      // TODO: The star button is still present in the document. Redo test to support not visable but in document.
      expect(queryByTestId('star-filter-button')).toBeInTheDocument();
    });

    it.skip('renders a button group and switches views', async () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider>
              <ContactsPageProvider>
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
                  openEditFieldsModal={openEditFieldsModal}
                  buttonGroup={<ButtonGroup />}
                />
              </ContactsPageProvider>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>,
      );

      expect(getByTestId('list-button')).toBeInTheDocument();
      userEvent.click(getByTestId('list-button'));

      await waitFor(() =>
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/accountLists/123/contacts/',
          query: {},
        }),
      );
    });
  });

  it('opens the more actions menu and clicks the add task action', () => {
    const { getByPlaceholderText, getByTestId, getByText, queryByText } =
      render(
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
            openAddToAppealModal={openAddToAppealModal}
            openEditFieldsModal={openEditFieldsModal}
            openHideContactsModal={openHideContactsModal}
            openRemoveTagsModal={openRemoveTagsModal}
            openAddTagsModal={openAddTagsModal}
            openCreateAppealModal={openCreateAppealModal}
            openExportEmailsModal={openExportEmailsModal}
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

  it('opens the more actions menu and clicks the log task action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Log Task')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Log Task')).toBeInTheDocument();
    userEvent.click(getByText('Log Task'));
    expect(openTaskModal).toHaveBeenCalledWith({
      view: 'log',
      defaultValues: { contactIds: selectedIds },
    });
  });

  it('opens the more actions menu and clicks the add tags action', () => {
    const { getByPlaceholderText, getByTestId, getByText, queryByText } =
      render(
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
            openAddToAppealModal={openAddToAppealModal}
            openEditFieldsModal={openEditFieldsModal}
            openHideContactsModal={openHideContactsModal}
            openRemoveTagsModal={openRemoveTagsModal}
            openAddTagsModal={openAddTagsModal}
            openCreateAppealModal={openCreateAppealModal}
            openExportEmailsModal={openExportEmailsModal}
          />
        </ThemeProvider>,
      );

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Add Tags')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Add Tags')).toBeInTheDocument();
    userEvent.click(getByText('Add Tags'));
    expect(openAddTagsModal).toHaveBeenCalledWith(true);
    expect(getByTestId('star-filter-button')).toBeInTheDocument();
    expect(getByTestId('showing-text')).toBeInTheDocument();
  });

  it('opens the more actions menu and clicks the edit fields action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Edit Fields')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Edit Fields')).toBeInTheDocument();
    userEvent.click(getByText('Edit Fields'));
    expect(openEditFieldsModal).toHaveBeenCalled();
  });

  it('opens the more actions menu and clicks the add to appeal action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Add to Appeal')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Add to Appeal')).toBeInTheDocument();
    userEvent.click(getByText('Add to Appeal'));
    expect(openAddToAppealModal).toHaveBeenCalled();
  });

  it('opens the more actions menu and clicks the add to new appeal action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Add to New Appeal')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Add to New Appeal')).toBeInTheDocument();
    userEvent.click(getByText('Add to New Appeal'));
    expect(openCreateAppealModal).toHaveBeenCalled();
  });

  it('opens the more actions menu and clicks the hide contacts action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Hide Contacts')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Hide Contacts')).toBeInTheDocument();
    userEvent.click(getByText('Hide Contacts'));
    expect(openHideContactsModal).toHaveBeenCalled();
  });

  it('opens the more actions menu and clicks the remove tags action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Remove Tags')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Remove Tags')).toBeInTheDocument();
    userEvent.click(getByText('Remove Tags'));
    expect(openRemoveTagsModal).toHaveBeenCalled();
  });

  it('opens the more actions menu and clicks the export emails action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Export Emails')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Export Emails')).toBeInTheDocument();
    userEvent.click(getByText('Export Emails'));
    expect(openExportEmailsModal).toHaveBeenCalled();
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
            openAddToAppealModal={openAddToAppealModal}
            openEditFieldsModal={openEditFieldsModal}
            openHideContactsModal={openHideContactsModal}
            openRemoveTagsModal={openRemoveTagsModal}
            openAddTagsModal={openAddTagsModal}
            openCreateAppealModal={openCreateAppealModal}
            openExportEmailsModal={openExportEmailsModal}
            openDeleteTasksModal={openDeleteTasksModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
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
          openAddToAppealModal={openAddToAppealModal}
          openEditFieldsModal={openEditFieldsModal}
          openHideContactsModal={openHideContactsModal}
          openRemoveTagsModal={openRemoveTagsModal}
          openAddTagsModal={openAddTagsModal}
          openCreateAppealModal={openCreateAppealModal}
          openExportEmailsModal={openExportEmailsModal}
        />
      </ThemeProvider>,
    );
    expect(queryByText('Showing {{count}}')).not.toBeInTheDocument();
  });

  it('opens the more actions menu and clicks the complete tasks action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          selectedIds={selectedIds}
          page="task"
          activeFilters={false}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
          openCompleteTasksModal={openCompleteTasksModal}
          openDeleteTasksModal={openDeleteTasksModal}
          openEditTasksModal={openEditTasksModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Tasks')).toBeInTheDocument();
    expect(queryByText('Complete Tasks')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Complete Tasks')).toBeInTheDocument();
    userEvent.click(getByText('Complete Tasks'));
    expect(openCompleteTasksModal).toHaveBeenCalled();
  });

  it('opens the more actions menu and clicks the edit tasks action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          selectedIds={selectedIds}
          page="task"
          activeFilters={false}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
          openCompleteTasksModal={openCompleteTasksModal}
          openEditTasksModal={openEditTasksModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Tasks')).toBeInTheDocument();
    expect(queryByText('Edit Tasks')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Edit Tasks')).toBeInTheDocument();
    userEvent.click(getByText('Edit Tasks'));
    expect(openEditTasksModal).toHaveBeenCalled();
  });

  it('opens the more actions menu and clicks the delete tasks action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          selectedIds={selectedIds}
          page="task"
          activeFilters={false}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
          openCompleteTasksModal={openCompleteTasksModal}
          openEditTasksModal={openEditTasksModal}
          openDeleteTasksModal={openDeleteTasksModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Tasks')).toBeInTheDocument();
    expect(queryByText('Delete Tasks')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Delete Tasks')).toBeInTheDocument();
    userEvent.click(getByText('Delete Tasks'));
    expect(openDeleteTasksModal).toHaveBeenCalled();
  });

  it('opens the more actions menu and clicks the add tags (tasks) action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          selectedIds={selectedIds}
          page="task"
          activeFilters={false}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
          openCompleteTasksModal={openCompleteTasksModal}
          openEditTasksModal={openEditTasksModal}
          openDeleteTasksModal={openDeleteTasksModal}
          openTasksAddTagsModal={openTasksAddTagsModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Tasks')).toBeInTheDocument();
    expect(queryByText('Add Tag(s)')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Add Tag(s)')).toBeInTheDocument();
    userEvent.click(getByText('Add Tag(s)'));
    expect(openTasksAddTagsModal).toHaveBeenCalled();
  });

  it('opens the more actions menu and clicks the remove tags (tasks) action', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <ListHeader
          selectedIds={selectedIds}
          page="task"
          activeFilters={false}
          starredFilter={{}}
          toggleStarredFilter={toggleStarredFilter}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          toggleFilterPanel={toggleFilterPanel}
          onCheckAllItems={onCheckAllItems}
          onSearchTermChanged={onSearchTermChanged}
          openCompleteTasksModal={openCompleteTasksModal}
          openEditTasksModal={openEditTasksModal}
          openDeleteTasksModal={openDeleteTasksModal}
          openTasksAddTagsModal={openTasksAddTagsModal}
          openTasksRemoveTagsModal={openTasksRemoveTagsModal}
        />
      </ThemeProvider>,
    );

    expect(getByPlaceholderText('Search Tasks')).toBeInTheDocument();
    expect(queryByText('Remove Tag(s)')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Remove Tag(s)')).toBeInTheDocument();
    userEvent.click(getByText('Remove Tag(s)'));
    expect(openTasksRemoveTagsModal).toHaveBeenCalled();
  });
});
