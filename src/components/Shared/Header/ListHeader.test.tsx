import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import TestRouter from '__tests__/util/TestRouter';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { TasksMassActionsDropdown } from '../../Shared/MassActions/TasksMassActionsDropdown';
import {
  ListHeader,
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from './ListHeader';

const toggleFilterPanel = jest.fn();
const onSearchTermChanged = jest.fn();
const onCheckAllItems = jest.fn();
const toggleStarredFilter = jest.fn();
const selectedIds: string[] = ['abc'];
const mockedProps = {
  toggleStarredFilter,
  toggleFilterPanel,
  onCheckAllItems,
  onSearchTermChanged,
};
const push = jest.fn();
const mockEnqueue = jest.fn();

jest.mock('../../../../src/hooks/useAccountListId');
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

jest.mock('../../Shared/MassActions/TasksMassActionsDropdown', () => ({
  TasksMassActionsDropdown: jest.fn(
    jest.requireActual('../../Shared/MassActions/TasksMassActionsDropdown')
      .TasksMassActionsDropdown,
  ),
}));

const MocksProviders = (props: { children: JSX.Element }) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider>
      <SnackbarProvider>{props.children}</SnackbarProvider>
    </GqlMockedProvider>
  </ThemeProvider>
);

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

beforeEach(() => {
  (useAccountListId as jest.Mock).mockReturnValue(router);
});

const ButtonGroup: React.FC = () => {
  return (
    <>
      <Button
        data-testid="list-button"
        onClick={() =>
          push({ pathname: '/accountLists/123/contacts/', query: {} })
        }
      />
      <Button
        data-testid="map-button"
        onClick={() =>
          push({ pathname: '/accountLists/123/contacts/map', query: {} })
        }
      />
    </>
  );
};

describe('ListHeader', () => {
  describe('Contact', () => {
    it('renders contact header', () => {
      const { getByPlaceholderText, getByTestId, getByText } = render(
        <MocksProviders>
          <ListHeader
            selectedIds={selectedIds}
            page="contact"
            activeFilters={false}
            starredFilter={{}}
            headerCheckboxState={ListHeaderCheckBoxState.unchecked}
            filterPanelOpen={false}
            contactDetailsOpen={false}
            {...mockedProps}
          />
        </MocksProviders>,
      );

      expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
      expect(getByText('Actions')).toBeInTheDocument();
      expect(getByTestId('star-filter-button')).toBeInTheDocument();
      expect(getByTestId('showing-text')).toBeInTheDocument();
    });

    it('renders contact header with contact card open', () => {
      const { getByPlaceholderText, queryByTestId, queryByText } = render(
        <MocksProviders>
          <ListHeader
            selectedIds={selectedIds}
            page="contact"
            activeFilters={false}
            starredFilter={{}}
            contactsView={TableViewModeEnum.List}
            headerCheckboxState={ListHeaderCheckBoxState.unchecked}
            filterPanelOpen={true}
            contactDetailsOpen={true}
            {...mockedProps}
          />
        </MocksProviders>,
      );

      expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
      expect(queryByText('Actions')).not.toBeInTheDocument();
      // TODO: The star button is still present in the document. Redo test to support not visable but in document.
      expect(queryByTestId('star-filter-button')).toBeInTheDocument();
    });

    it('renders a button group and switches views', async () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <MocksProviders>
            <ListHeader
              selectedIds={selectedIds}
              page="contact"
              activeFilters={false}
              starredFilter={{}}
              contactsView={TableViewModeEnum.List}
              headerCheckboxState={ListHeaderCheckBoxState.unchecked}
              filterPanelOpen={true}
              contactDetailsOpen={true}
              buttonGroup={<ButtonGroup />}
              {...mockedProps}
            />
          </MocksProviders>
        </TestRouter>,
      );

      expect(getByTestId('list-button')).toBeInTheDocument();
      userEvent.click(getByTestId('list-button'));

      await waitFor(() =>
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/accountLists/123/contacts/',
          query: {},
        }),
      );

      userEvent.click(getByTestId('map-button'));

      await waitFor(() =>
        expect(router.push).toHaveBeenCalledWith({
          pathname: '/accountLists/123/contacts/map',
          query: {},
        }),
      );
    });
  });

  it('opens the more actions menu and clicks the add tags action', () => {
    const { getByPlaceholderText, getByTestId, getByText, queryByText } =
      render(
        <MocksProviders>
          <ListHeader
            selectedIds={selectedIds}
            page="contact"
            activeFilters={false}
            starredFilter={{}}
            headerCheckboxState={ListHeaderCheckBoxState.unchecked}
            filterPanelOpen={false}
            contactDetailsOpen={false}
            {...mockedProps}
          />
        </MocksProviders>,
      );

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Add Tags')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Add Tags')).toBeInTheDocument();
    userEvent.click(getByText('Add Tags'));
    expect(
      queryByText('Create New Tags (separate multiple tags with Enter key) *'),
    ).toBeInTheDocument();
    expect(getByTestId('star-filter-button')).toBeInTheDocument();
    expect(getByTestId('showing-text')).toBeInTheDocument();
  });

  describe('Task', () => {
    it('renders task header', () => {
      const { getByPlaceholderText } = render(
        <MocksProviders>
          <ListHeader
            selectedIds={selectedIds}
            page="task"
            activeFilters={false}
            headerCheckboxState={ListHeaderCheckBoxState.unchecked}
            starredFilter={{}}
            filterPanelOpen={false}
            contactDetailsOpen={false}
            {...mockedProps}
          />
        </MocksProviders>,
      );

      expect(getByPlaceholderText('Search Tasks')).toBeVisible();
    });
  });

  it('checkbox is unchecked', async () => {
    const { getByRole } = render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          {...mockedProps}
        />
      </MocksProviders>,
    );

    const checkbox = getByRole('checkbox');

    userEvent.click(checkbox);
    userEvent.click(checkbox);

    expect(checkbox).toHaveProperty('checked', false);
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('checkbox is checked', async () => {
    const { getByRole } = render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          {...mockedProps}
        />
      </MocksProviders>,
    );

    const checkbox = getByRole('checkbox');
    userEvent.click(checkbox);
    expect(onCheckAllItems).toHaveBeenCalled();
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('filters button displays for no filters', async () => {
    const { getByRole } = render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          {...mockedProps}
        />
      </MocksProviders>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });

    expect(filterButton).toHaveStyle({ backgroundColor: 'transparent' });
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('filters button displays for open filter panel', async () => {
    const { getByRole } = render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          filterPanelOpen={true}
          contactDetailsOpen={false}
          {...mockedProps}
        />
      </MocksProviders>,
    );

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });

    expect(filterButton).toHaveStyle({
      backgroundColor: 'transparent',
    });
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('filters button displays for active filters', async () => {
    const { getByRole } = render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          {...mockedProps}
        />
      </MocksProviders>,
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

  it('filters button displays for active filters and filter panel open', async () => {
    const { getByRole } = render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          filterPanelOpen={true}
          contactDetailsOpen={false}
          {...mockedProps}
        />
      </MocksProviders>,
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
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={false}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          {...mockedProps}
        />
      </MocksProviders>,
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
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          {...mockedProps}
        />
      </MocksProviders>,
    );
    const textbox = getByRole('textbox');

    userEvent.type(textbox, searchText);

    expect(toggleFilterPanel).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(onSearchTermChanged).toHaveBeenCalledWith(searchText);
  });

  it('press star filter button and set to true', async () => {
    const { getByTestId } = render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{}}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          {...mockedProps}
        />
      </MocksProviders>,
    );
    const starFilterButton = getByTestId('star-filter-button');

    userEvent.click(starFilterButton);

    expect(toggleStarredFilter).toHaveBeenCalledWith({ starred: true });
  });

  it('reset the star filter', async () => {
    const { getByTestId } = render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{ starred: true }}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          {...mockedProps}
        />
      </MocksProviders>,
    );
    const starFilterButton = getByTestId('star-filter-button');

    userEvent.click(starFilterButton);

    expect(toggleStarredFilter).toHaveBeenCalledWith({});
  });

  it('renders the total count', async () => {
    const { getByText } = render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{ starred: true }}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          contactsView={TableViewModeEnum.List}
          totalItems={100}
          {...mockedProps}
        />
      </MocksProviders>,
    );
    expect(getByText('Showing 100')).toBeInTheDocument();
  });

  it('does not renders the total count', async () => {
    const { queryByText } = render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="contact"
          activeFilters={true}
          contactsView={TableViewModeEnum.Flows}
          headerCheckboxState={ListHeaderCheckBoxState.unchecked}
          starredFilter={{ starred: true }}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          totalItems={100}
          {...mockedProps}
        />
      </MocksProviders>,
    );
    expect(queryByText('Showing', { exact: false })).not.toBeInTheDocument();
  });

  it('counts total tasks when all are selected', async () => {
    render(
      <MocksProviders>
        <ListHeader
          selectedIds={selectedIds}
          page="task"
          activeFilters={true}
          headerCheckboxState={ListHeaderCheckBoxState.checked}
          starredFilter={{ starred: true }}
          filterPanelOpen={false}
          contactDetailsOpen={false}
          contactsView={TableViewModeEnum.List}
          totalItems={100}
          {...mockedProps}
        />
      </MocksProviders>,
    );
    expect(
      (
        TasksMassActionsDropdown as jest.MockedFn<
          typeof TasksMassActionsDropdown
        >
      ).mock.lastCall?.[0].selectedIdCount,
    ).toBe(100);
  });
});
