import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import {
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from 'src/components/Shared/Header/ListHeader';
import { UrlFiltersProvider } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import theme from 'src/theme';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';
import { ContactsMainPanelHeader } from './ContactsMainPanelHeader';

const accountListId = 'account-list-1';
const setViewMode = jest.fn();
const toggleFilterPanel = jest.fn();

const router = {
  query: { accountListId },
  isReady: true,
};

const setOnline = (online: boolean) =>
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);

interface TestComponentProps {
  viewMode?: TableViewModeEnum;
  offlineMode?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  viewMode = TableViewModeEnum.List,
  offlineMode = false,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter router={router}>
        <GqlMockedProvider>
          <UrlFiltersProvider>
            <ContactPanelProvider>
              <ContactsContext.Provider
                value={
                  {
                    accountListId,
                    contactsQueryResult: {
                      data: { contacts: { totalCount: 5 } },
                    },
                    toggleFilterPanel,
                    toggleSelectAll: jest.fn(),
                    selectionType: ListHeaderCheckBoxState.Partial,
                    filterPanelOpen: false,
                    viewMode,
                    setViewMode,
                    selectedIds: ['contact-1'],
                    offlineMode,
                  } as unknown as ContactsType
                }
              >
                <ContactsMainPanelHeader />
              </ContactsContext.Provider>
            </ContactPanelProvider>
          </UrlFiltersProvider>
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('ContactsMainPanelHeader', () => {
  beforeEach(() => {
    setOnline(true);
  });

  describe('on desktop', () => {
    beforeEach(() => {
      matchMediaMock({ width: '1024px' });
    });

    it('shows the view toggle buttons and View Settings in flows view', async () => {
      const { getByRole, queryByRole, findByTitle } = render(
        <TestComponent viewMode={TableViewModeEnum.Flows} />,
      );

      userEvent.click(await findByTitle('Map View'));
      expect(setViewMode).toHaveBeenCalledWith(TableViewModeEnum.Map);
      expect(getByRole('link', { name: 'View Settings' })).toHaveAttribute(
        'href',
        `/accountLists/${accountListId}/contacts/flows/setup`,
      );
      expect(
        queryByRole('button', { name: 'Change View' }),
      ).not.toBeInTheDocument();
    });

    it('enables every control online', () => {
      setOnline(true);
      const { getByRole, getByTestId } = render(<TestComponent />);

      expect(
        getByRole('button', { name: 'Toggle Filter Panel' }),
      ).not.toBeDisabled();
      expect(getByRole('textbox')).not.toBeDisabled();
      expect(getByTestId('star-filter-button')).not.toBeDisabled();
      expect(getByRole('button', { name: 'Actions' })).not.toBeDisabled();
      expect(getByRole('checkbox')).toBeInTheDocument();
      expect(
        getByRole('button', { name: 'Column Workflow View' }),
      ).not.toBeDisabled();
      expect(getByRole('button', { name: 'Map View' })).not.toBeDisabled();
    });

    it('disables search, starred, actions, Flows, and Map offline but not the filter toggle', () => {
      setOnline(false);
      const { getByRole, getByTestId } = render(<TestComponent />);

      const filterToggle = getByRole('button', {
        name: 'Toggle Filter Panel',
      });
      expect(filterToggle).not.toBeDisabled();
      userEvent.click(filterToggle);
      expect(toggleFilterPanel).toHaveBeenCalled();
      expect(getByRole('textbox')).toBeDisabled();
      expect(getByTestId('star-filter-button')).toBeDisabled();
      expect(getByRole('button', { name: 'Actions' })).toBeDisabled();
      expect(getByRole('checkbox')).toBeInTheDocument();
      expect(
        getByRole('button', { name: 'Column Workflow View' }),
      ).toBeDisabled();
      expect(getByRole('button', { name: 'Map View' })).toBeDisabled();
    });

    it('hides the selection controls in offline mode', () => {
      setOnline(true);
      const { getByRole, queryByRole, queryByText } = render(
        <TestComponent offlineMode />,
      );

      expect(queryByRole('checkbox')).not.toBeInTheDocument();
      expect(queryByText('Actions')).not.toBeInTheDocument();
      expect(
        getByRole('button', { name: 'Toggle Filter Panel' }),
      ).not.toBeDisabled();
      expect(
        getByRole('button', { name: 'Column Workflow View' }),
      ).not.toBeDisabled();
      expect(getByRole('button', { name: 'Map View' })).not.toBeDisabled();
    });

    it('hides the selection controls and disables the rest offline in offline mode', () => {
      setOnline(false);
      const { getByRole, queryByRole, queryByText } = render(
        <TestComponent offlineMode />,
      );

      expect(queryByRole('checkbox')).not.toBeInTheDocument();
      expect(queryByText('Actions')).not.toBeInTheDocument();
      expect(getByRole('textbox')).toBeDisabled();
      expect(getByRole('button', { name: 'Map View' })).toBeDisabled();
    });
  });

  describe('on phones', () => {
    beforeEach(() => {
      matchMediaMock({ width: '390px' });
    });

    it('collapses the view switch and View Settings into a menu', async () => {
      const { findByRole, getByRole, queryByTitle, queryByRole } = render(
        <TestComponent viewMode={TableViewModeEnum.Flows} />,
      );

      expect(queryByTitle('Map View')).not.toBeInTheDocument();
      expect(
        queryByRole('link', { name: 'View Settings' }),
      ).not.toBeInTheDocument();

      const changeViewButton = await findByRole('button', {
        name: 'Change View',
      });
      expect(
        within(changeViewButton).getByTestId('ViewColumnIcon'),
      ).toBeInTheDocument();

      userEvent.click(changeViewButton);
      expect(
        getByRole('menuitem', { name: 'Column Workflow View' }),
      ).toHaveClass('Mui-selected');
      expect(getByRole('menuitem', { name: 'View Settings' })).toHaveAttribute(
        'href',
        `/accountLists/${accountListId}/contacts/flows/setup`,
      );

      userEvent.click(getByRole('menuitem', { name: 'Map View' }));
      expect(setViewMode).toHaveBeenCalledWith(TableViewModeEnum.Map);
      await waitFor(() => expect(queryByRole('menu')).not.toBeInTheDocument());
    });

    it('hides View Settings outside of flows view', async () => {
      const { findByRole, getByRole, queryByRole } = render(
        <TestComponent viewMode={TableViewModeEnum.List} />,
      );

      const changeViewButton = await findByRole('button', {
        name: 'Change View',
      });
      expect(
        within(changeViewButton).getByTestId('FormatListBulletedIcon'),
      ).toBeInTheDocument();

      userEvent.click(changeViewButton);
      expect(getByRole('menuitem', { name: 'List View' })).toHaveClass(
        'Mui-selected',
      );
      expect(
        queryByRole('menuitem', { name: 'View Settings' }),
      ).not.toBeInTheDocument();
    });

    it('disables Flows and Map in the menu offline', async () => {
      setOnline(false);
      const { findByRole, getByRole } = render(<TestComponent />);

      userEvent.click(await findByRole('button', { name: 'Change View' }));
      expect(getByRole('menuitem', { name: 'List View' })).not.toHaveAttribute(
        'aria-disabled',
      );
      expect(
        getByRole('menuitem', { name: 'Column Workflow View' }),
      ).toHaveAttribute('aria-disabled', 'true');
      expect(getByRole('menuitem', { name: 'Map View' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });
  });
});
