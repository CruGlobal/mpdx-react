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

const router = {
  query: { accountListId },
  isReady: true,
};

interface TestComponentProps {
  viewMode?: TableViewModeEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  viewMode = TableViewModeEnum.List,
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
                    toggleFilterPanel: jest.fn(),
                    toggleSelectAll: jest.fn(),
                    selectionType: ListHeaderCheckBoxState.Unchecked,
                    filterPanelOpen: false,
                    viewMode,
                    setViewMode,
                    selectedIds: [],
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
  });
});
