import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
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

const toggleFilterPanel = jest.fn();

const setOnline = (online: boolean) =>
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);

interface TestComponentProps {
  offlineMode?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  offlineMode = false,
}) => (
  <TestRouter
    router={{
      query: { accountListId: 'account-list-1' },
      isReady: true,
    }}
  >
    <ThemeProvider theme={theme}>
      <GqlMockedProvider>
        <SnackbarProvider>
          <ContactPanelProvider>
            <UrlFiltersProvider>
              <ContactsContext.Provider
                value={
                  {
                    accountListId: 'account-list-1',
                    contactsQueryResult: {
                      data: { contacts: { totalCount: 10 } },
                    },
                    toggleFilterPanel,
                    toggleSelectAll: jest.fn(),
                    selectionType: ListHeaderCheckBoxState.Partial,
                    filterPanelOpen: false,
                    viewMode: TableViewModeEnum.List,
                    setViewMode: jest.fn(),
                    selectedIds: ['contact-1'],
                    offlineMode,
                  } as unknown as ContactsType
                }
              >
                <ContactsMainPanelHeader />
              </ContactsContext.Provider>
            </UrlFiltersProvider>
          </ContactPanelProvider>
        </SnackbarProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('ContactsMainPanelHeader', () => {
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

    const filterToggle = getByRole('button', { name: 'Toggle Filter Panel' });
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
