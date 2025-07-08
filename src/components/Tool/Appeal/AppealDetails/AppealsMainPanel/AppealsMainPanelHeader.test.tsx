import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { ListHeaderCheckBoxState } from 'src/components/Shared/Header/ListHeader';
import theme from 'src/theme';
import {
  AppealsContext,
  AppealsType,
  TableViewModeEnum,
} from '../../AppealsContext/AppealsContext';
import { AppealsMainPanelHeader } from './AppealsMainPanelHeader';

const mockEnqueue = jest.fn();

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

const accountListId = 'accountListId';
const setViewMode = jest.fn();
const toggleFilterPanel = jest.fn();
const toggleSelectAll = jest.fn();
const routerReplace = jest.fn();
const defaultRouter = {
  query: { accountListId },
  replace: routerReplace,
  isReady: true,
};
const defaultContactsQueryResult = {
  data: { contacts: { nodes: [] } },
  loading: true,
};
type ComponentsProps = {
  router?: object;
  contactsQueryResult?: object;
};

const Components = ({
  router = defaultRouter,
  contactsQueryResult = defaultContactsQueryResult,
}: ComponentsProps) => (
  <SnackbarProvider>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <AppealsWrapper>
              <AppealsContext.Provider
                value={
                  {
                    toggleFilterPanel,
                    toggleSelectAll,
                    selectionType: ListHeaderCheckBoxState.Unchecked,
                    filterPanelOpen: false,
                    viewMode: TableViewModeEnum.List,
                    setViewMode,
                    selectedIds: [],
                    contactsQueryResult,
                  } as unknown as AppealsType
                }
              >
                <AppealsMainPanelHeader />
              </AppealsContext.Provider>
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </LocalizationProvider>
  </SnackbarProvider>
);

describe('AppealsMainPanelHeader', () => {
  it('renders default view', () => {
    const { getByRole } = render(<Components />);

    expect(getByRole('link', { name: 'Appeals' })).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Toggle Filter Panel' }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'List View' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Flows View' })).toBeInTheDocument();
  });

  it('should open filters', () => {
    const { getByRole } = render(
      <Components
        router={{
          ...defaultRouter,
          pathname: `/accountLists/${accountListId}/tools/appeals/appeal-Id-1/list`,
        }}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Toggle Filter Panel' }));

    expect(toggleFilterPanel).toHaveBeenCalled();
  });

  it('should disable select all contacts if no contacts', () => {
    const { getByRole } = render(
      <Components
        router={{
          ...defaultRouter,
          pathname: `/accountLists/${accountListId}/tools/appeals/appeal-Id-1/list`,
        }}
      />,
    );

    expect(getByRole('checkbox')).toBeDisabled();
  });

  it('should search contacts', async () => {
    const { getByRole } = render(
      <Components
        router={{
          ...defaultRouter,
          pathname: `/accountLists/${accountListId}/tools/appeals/appeal-Id-1/list`,
        }}
      />,
    );

    userEvent.type(getByRole('textbox'), 'search term');

    await waitFor(
      () =>
        expect(routerReplace.mock.lastCall[0].query.searchTerm).toEqual(
          'search term',
        ),
      { timeout: 3000 },
    );
  });

  it('should change view', async () => {
    const { getByRole } = render(
      <Components
        router={{
          ...defaultRouter,
          pathname: `/accountLists/${accountListId}/tools/appeals/appeal-Id-1/list`,
        }}
      />,
    );

    expect(getByRole('button', { name: 'List View' })).toBeDisabled();
    userEvent.click(getByRole('button', { name: 'Flows View' }));
    expect(setViewMode).toHaveBeenCalledWith('flows');
  });

  it('should allow select all to be checked', () => {
    const { getByRole } = render(
      <Components
        router={{
          ...defaultRouter,
          pathname: `/accountLists/${accountListId}/tools/appeals/appeal-Id-1/list`,
        }}
        contactsQueryResult={{
          data: {
            contacts: {
              nodes: [
                {
                  id: '1',
                  name: 'Test Name',
                  starred: true,
                  avatar: 'avatar.jpg',
                  pledgeAmount: 100,
                  pledgeCurrency: 'USD',
                  pledgeReceived: false,
                  uncompletedTasksCount: 0,
                },
              ],
              totalCount: 1,
            },
          },
          loading: false,
        }}
      />,
    );

    expect(getByRole('checkbox')).not.toBeDisabled();
    userEvent.click(getByRole('checkbox'));

    expect(toggleSelectAll).toHaveBeenCalled();
  });
});
