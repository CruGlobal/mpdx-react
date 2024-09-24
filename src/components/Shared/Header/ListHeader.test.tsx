import React, { ReactElement } from 'react';
import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import i18n from 'src/lib/i18n';
import theme from '../../../theme';
import { TasksMassActionsDropdown } from '../MassActions/TasksMassActionsDropdown';
import {
  ListHeader,
  ListHeaderCheckBoxState,
  PageEnum,
  TableViewModeEnum,
} from './ListHeader';

const toggleFilterPanel = jest.fn();
const onSearchTermChanged = jest.fn();
const onCheckAllItems = jest.fn();
const toggleStarredFilter = jest.fn();
const defaultSelectedIds: string[] = ['abc'];
const mockedProps = {
  toggleStarredFilter,
  toggleFilterPanel,
  onCheckAllItems,
  onSearchTermChanged,
};
const push = jest.fn();
const mockEnqueue = jest.fn();

jest.mock('src/hooks/useAccountListId');
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

type StarredFilter = ContactFilterSetInput | TaskFilterSetInput | undefined;
interface ComponentsProps {
  selectedIds?: string[];
  page?: PageEnum;
  activeFilters?: boolean;
  starredFilter?: StarredFilter | null;
  contactsView?: TableViewModeEnum;
  headerCheckboxState?: ListHeaderCheckBoxState;
  filterPanelOpen?: boolean;
  contactDetailsOpen?: boolean;
  buttonGroup?: ReactElement;
  totalItems?: number;
  showShowingCount?: boolean;
}

const Components = ({
  selectedIds = defaultSelectedIds,
  page = PageEnum.Contact,
  activeFilters = false,
  starredFilter = {},
  contactsView,
  headerCheckboxState = ListHeaderCheckBoxState.Unchecked,
  filterPanelOpen = false,
  contactDetailsOpen = false,
  buttonGroup,
  totalItems,
  showShowingCount,
}: ComponentsProps) => (
  <ThemeProvider theme={theme}>
    <I18nextProvider i18n={i18n}>
      <GqlMockedProvider>
        <SnackbarProvider>
          <ListHeader
            selectedIds={selectedIds}
            page={page}
            activeFilters={activeFilters}
            starredFilter={starredFilter as StarredFilter}
            contactsView={contactsView}
            headerCheckboxState={headerCheckboxState}
            filterPanelOpen={filterPanelOpen}
            contactDetailsOpen={contactDetailsOpen}
            buttonGroup={buttonGroup}
            totalItems={totalItems}
            showShowingCount={showShowingCount}
            {...mockedProps}
          />
        </SnackbarProvider>
      </GqlMockedProvider>
    </I18nextProvider>
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
        <Components />,
      );

      expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
      expect(getByText('Actions')).toBeInTheDocument();
      expect(getByTestId('star-filter-button')).toBeInTheDocument();
      expect(getByTestId('showing-text')).toBeInTheDocument();
    });

    it('renders contact header with contact card open', () => {
      const { getByPlaceholderText, queryByTestId, queryByText } = render(
        <Components
          contactsView={TableViewModeEnum.List}
          filterPanelOpen={true}
          contactDetailsOpen={true}
        />,
      );

      expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
      expect(queryByText('Actions')).not.toBeInTheDocument();
      // TODO: The star button is still present in the document. Redo test to support not visable but in document.
      expect(queryByTestId('star-filter-button')).toBeInTheDocument();
    });

    it('renders a button group and switches views', async () => {
      const { getByTestId } = render(
        <Components
          contactsView={TableViewModeEnum.List}
          filterPanelOpen={true}
          contactDetailsOpen={true}
          buttonGroup={<ButtonGroup />}
        />,
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

  it('opens the more actions menu and clicks the add tags action', async () => {
    const {
      findByText,
      getByPlaceholderText,
      getByTestId,
      getByText,
      queryByText,
    } = render(<Components />);

    expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
    expect(queryByText('Add Tags')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Add Tags')).toBeInTheDocument();
    userEvent.click(getByText('Add Tags'));
    expect(
      await findByText(
        'Create New Tags (separate multiple tags with Enter key) *',
      ),
    ).toBeInTheDocument();
    expect(getByTestId('star-filter-button')).toBeInTheDocument();
    expect(getByTestId('showing-text')).toBeInTheDocument();
  });

  describe('Task', () => {
    it('renders task header', () => {
      const { getByPlaceholderText } = render(
        <Components page={PageEnum.Task} />,
      );

      expect(getByPlaceholderText('Search Tasks')).toBeVisible();
    });
  });

  it('checkbox is unchecked', async () => {
    const { getByRole } = render(<Components totalItems={50} />);

    const checkbox = getByRole('checkbox');

    userEvent.click(checkbox);
    userEvent.click(checkbox);

    expect(checkbox).toHaveProperty('checked', false);
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('has disabled checkbox', async () => {
    const { getByRole } = render(<Components totalItems={0} />);

    const checkbox = getByRole('checkbox');
    expect(checkbox).toHaveProperty('disabled', true);
  });

  it('checkbox is checked', async () => {
    const { getByRole } = render(<Components totalItems={50} />);

    const checkbox = getByRole('checkbox');
    userEvent.click(checkbox);
    expect(onCheckAllItems).toHaveBeenCalled();
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('filters button displays for no filters', async () => {
    const { getByRole } = render(<Components />);

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });

    expect(filterButton).toHaveStyle({ backgroundColor: 'transparent' });
    expect(toggleFilterPanel).not.toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('filters button displays for open filter panel', async () => {
    const { getByRole } = render(<Components />);

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
    const { getByRole } = render(<Components activeFilters={true} />);

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
      <Components activeFilters={true} filterPanelOpen={true} />,
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
    const { getByRole } = render(<Components />);

    const filterButton = getByRole('button', {
      name: 'Toggle Filter Panel',
    });

    userEvent.click(filterButton);

    expect(toggleFilterPanel).toHaveBeenCalled();
    expect(onSearchTermChanged).not.toHaveBeenCalled();
  });

  it('search text changed', async () => {
    const searchText = 'name';

    const { getByRole } = render(<Components activeFilters={true} />);
    const textbox = getByRole('textbox');

    userEvent.type(textbox, searchText);

    expect(toggleFilterPanel).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(onSearchTermChanged).toHaveBeenCalledWith(searchText);
  });

  it('press star filter button and set to true', async () => {
    const { getByTestId } = render(<Components activeFilters={true} />);
    const starFilterButton = getByTestId('star-filter-button');

    userEvent.click(starFilterButton);

    expect(toggleStarredFilter).toHaveBeenCalledWith({ starred: true });
  });

  it('reset the star filter', async () => {
    const { getByTestId } = render(
      <Components activeFilters={true} starredFilter={{ starred: true }} />,
    );
    const starFilterButton = getByTestId('star-filter-button');

    userEvent.click(starFilterButton);

    expect(toggleStarredFilter).toHaveBeenCalledWith({});
  });

  it('renders the total count', async () => {
    const { getByText } = render(
      <Components
        activeFilters={true}
        starredFilter={{ starred: true }}
        contactsView={TableViewModeEnum.List}
        totalItems={100}
        showShowingCount={true}
      />,
    );
    expect(getByText('Showing 100')).toBeInTheDocument();
  });

  it('does not renders the total count', async () => {
    const { queryByText } = render(
      <Components
        activeFilters={true}
        starredFilter={{ starred: true }}
        contactsView={TableViewModeEnum.Flows}
        totalItems={100}
      />,
    );
    expect(queryByText('Showing', { exact: false })).not.toBeInTheDocument();
  });

  it('counts total tasks when all are selected', async () => {
    render(
      <Components
        page={PageEnum.Task}
        activeFilters={true}
        headerCheckboxState={ListHeaderCheckBoxState.Checked}
        starredFilter={{ starred: true }}
        contactsView={TableViewModeEnum.List}
        totalItems={100}
      />,
    );
    expect(
      (
        TasksMassActionsDropdown as jest.MockedFn<
          typeof TasksMassActionsDropdown
        >
      ).mock.lastCall?.[0].selectedIdCount,
    ).toBe(100);
  });

  describe('Report', () => {
    it('does not render the total count or map/list view icons', async () => {
      const { queryByText, getByPlaceholderText, queryByTestId } = render(
        <Components
          selectedIds={[]}
          starredFilter={null}
          page={PageEnum.Report}
          totalItems={100}
        />,
      );
      expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
      expect(queryByText('Actions')).not.toBeInTheDocument();
      expect(queryByTestId('star-filter-button')).not.toBeInTheDocument();
      expect(queryByText('Showing', { exact: false })).not.toBeInTheDocument();
      expect(queryByTestId('list-button')).not.toBeInTheDocument();
    });

    it('display mass actions menu when an contact is checked', async () => {
      const { queryByText, getByText, getByRole } = render(
        <Components page={PageEnum.Report} totalItems={100} />,
      );

      const checkbox = getByRole('checkbox');
      userEvent.click(checkbox);
      expect(onCheckAllItems).toHaveBeenCalled();
      expect(toggleFilterPanel).not.toHaveBeenCalled();
      expect(onSearchTermChanged).not.toHaveBeenCalled();

      expect(queryByText('Add Tags')).not.toBeInTheDocument();
      const actions = getByText('Actions');
      userEvent.click(actions);
      expect(getByText('Add Tags')).toBeInTheDocument();
      userEvent.click(getByText('Add Tags'));
      expect(
        queryByText(
          'Create New Tags (separate multiple tags with Enter key) *',
        ),
      ).toBeInTheDocument();
    });
  });

  it('shows the selected count', () => {
    const { getByText } = render(
      <Components
        selectedIds={['a', 'b', 'c']}
        page={PageEnum.Appeal}
        contactsView={TableViewModeEnum.Flows}
      />,
    );

    expect(getByText('3 Selected')).toBeInTheDocument();
    expect(getByText('Actions')).toBeInTheDocument();
  });

  it('does not shows the selected count', () => {
    const { queryByText } = render(
      <Components
        selectedIds={[]}
        page={PageEnum.Appeal}
        contactsView={TableViewModeEnum.Flows}
      />,
    );
    expect(queryByText('Selected')).not.toBeInTheDocument();
    expect(queryByText('Actions')).not.toBeInTheDocument();
  });

  it('Should update count upon deletion', async () => {
    const { queryByText, getByText, getAllByTestId } = render(
      <Components
        selectedIds={['a', 'b', 'c']}
        page={PageEnum.Task}
        totalItems={50}
        showShowingCount={true}
      />,
    );
    expect(queryByText('Showing 50')).toBeInTheDocument();
    expect(queryByText('3 Selected')).toBeInTheDocument();
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(getByText('Delete Tasks')).toBeInTheDocument();
    userEvent.click(getByText('Delete Tasks'));
    await waitFor(() => {
      expect(
        queryByText('Are you sure you wish to delete the 3 selected tasks?'),
      ).toBeInTheDocument();
    });

    userEvent.click(getAllByTestId('action-button')[0]);

    expect(queryByText('Showing 50')).toBeInTheDocument();
  });
});
