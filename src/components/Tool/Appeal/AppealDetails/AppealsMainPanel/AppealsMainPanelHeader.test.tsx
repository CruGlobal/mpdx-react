import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mediaQuery from 'css-mediaquery';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
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
const appealsHref = `/accountLists/${accountListId}/tools/appeals`;
const defaultContactsQueryResult = {
  data: { contacts: { nodes: [] } },
  loading: true,
};
type ComponentsProps = {
  router?: object;
  contactsQueryResult?: object;
  viewMode?: TableViewModeEnum;
};

const Components = ({
  router = defaultRouter,
  contactsQueryResult = defaultContactsQueryResult,
  viewMode = TableViewModeEnum.List,
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
                    accountListId,
                    toggleFilterPanel,
                    toggleSelectAll,
                    selectionType: ListHeaderCheckBoxState.Unchecked,
                    filterPanelOpen: false,
                    viewMode,
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

// jsdom's getComputedStyle skips @media rules, so apply the ones that match
// the given screen width on top of the computed style
const getStyleAtWidth = (
  element: Element,
  property: string,
  width: string,
): string => {
  let value = window.getComputedStyle(element).getPropertyValue(property);
  Array.from(document.styleSheets).forEach((sheet) =>
    Array.from(sheet.cssRules).forEach((rule) => {
      if (
        !(rule instanceof CSSMediaRule) ||
        !mediaQuery.match(rule.media.mediaText, { type: 'screen', width })
      ) {
        return;
      }
      Array.from(rule.cssRules).forEach((innerRule) => {
        if (
          innerRule instanceof CSSStyleRule &&
          element.matches(innerRule.selectorText)
        ) {
          value = innerRule.style.getPropertyValue(property) || value;
        }
      });
    }),
  );
  return value;
};

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

  describe('on tablets', () => {
    beforeEach(() => {
      matchMediaMock({ width: '768px' });
    });

    it('keeps the view toggle buttons and the labeled back button', () => {
      const { getByRole, queryByRole } = render(<Components />);

      const backLink = getByRole('link', { name: 'Appeals' });
      expect(backLink).toHaveTextContent('Appeals');
      expect(backLink).toHaveAttribute('href', appealsHref);
      expect(getByRole('button', { name: 'List View' })).toBeDisabled();
      expect(getByRole('button', { name: 'Flows View' })).toBeEnabled();
      expect(
        queryByRole('button', { name: 'Change View' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('on phones', () => {
    beforeEach(() => {
      matchMediaMock({ width: '390px' });
    });

    it.each(['360px', '390px'])(
      'swaps the List and Flows buttons for one view menu button at %s',
      (width) => {
        matchMediaMock({ width });
        const { getByRole, queryByRole, getByPlaceholderText } = render(
          <Components />,
        );

        const changeViewButton = getByRole('button', { name: 'Change View' });
        expect(changeViewButton).toHaveClass('MuiButton-outlined');
        expect(
          within(changeViewButton).getByTestId('FormatListBulletedIcon'),
        ).toBeInTheDocument();
        expect(
          queryByRole('button', { name: 'List View' }),
        ).not.toBeInTheDocument();
        expect(
          queryByRole('button', { name: 'Flows View' }),
        ).not.toBeInTheDocument();

        // The rest of the toolbar row is still there
        expect(getByRole('checkbox')).toBeInTheDocument();
        expect(
          getByRole('button', { name: 'Toggle Filter Panel' }),
        ).toBeInTheDocument();
        expect(getByPlaceholderText('Search Contacts')).toBeInTheDocument();
      },
    );

    it('switches to Flows view from the menu', async () => {
      const { getByRole, queryByRole } = render(<Components />);

      userEvent.click(getByRole('button', { name: 'Change View' }));
      expect(getByRole('menuitem', { name: 'List View' })).toHaveClass(
        'Mui-selected',
      );
      expect(getByRole('menuitem', { name: 'Flows View' })).not.toHaveClass(
        'Mui-selected',
      );

      userEvent.click(getByRole('menuitem', { name: 'Flows View' }));
      expect(setViewMode).toHaveBeenCalledWith(TableViewModeEnum.Flows);
      await waitFor(() => expect(queryByRole('menu')).not.toBeInTheDocument());
    });

    it('shows the Flows icon in Flows view and switches back to List view', () => {
      const { getByRole } = render(
        <Components viewMode={TableViewModeEnum.Flows} />,
      );

      const changeViewButton = getByRole('button', { name: 'Change View' });
      expect(
        within(changeViewButton).getByTestId('ViewColumnIcon'),
      ).toBeInTheDocument();

      userEvent.click(changeViewButton);
      expect(getByRole('menuitem', { name: 'Flows View' })).toHaveClass(
        'Mui-selected',
      );

      userEvent.click(getByRole('menuitem', { name: 'List View' }));
      expect(setViewMode).toHaveBeenCalledWith(TableViewModeEnum.List);
    });

    it('shows the Appeals back button as just the arrow', () => {
      const { getByRole } = render(<Components />);

      const backLink = getByRole('link', { name: 'Appeals' });
      expect(backLink).toHaveAttribute('href', appealsHref);
      expect(backLink).not.toHaveTextContent('Appeals');
      expect(
        within(backLink).getByTestId(/^ArrowBackIos(New)?Icon$/),
      ).toBeInTheDocument();
    });

    it('makes the back arrow square and as tall as the view menu button', () => {
      const { getByRole } = render(<Components />);

      expect(getByRole('link', { name: 'Appeals' })).toHaveStyle({
        width: '48px',
        height: '48px',
      });
      expect(getByRole('button', { name: 'Change View' })).toHaveStyle({
        height: '48px',
      });
    });

    it('leaves no extra right margin after the view menu', () => {
      const { getByRole } = render(<Components />);

      const viewSwitch = getByRole('button', {
        name: 'Change View',
      }).parentElement as HTMLElement;
      expect(
        parseFloat(getStyleAtWidth(viewSwitch, 'margin-right', '390px')),
      ).toBe(0);
      expect(
        parseFloat(getStyleAtWidth(viewSwitch, 'margin-right', '768px')),
      ).toBe(12);
    });
  });
});
