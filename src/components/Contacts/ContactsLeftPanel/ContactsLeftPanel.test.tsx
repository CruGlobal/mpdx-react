import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { coordinatesFromContacts } from 'pages/accountLists/[accountListId]/contacts/helpers';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { StatusEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import theme from 'src/theme';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import { ContactsLeftPanel } from './ContactsLeftPanel';

const router = {
  query: { accountListId: 'account-list-1' },
  isReady: true,
};

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

const userOptions = [
  {
    key: 'contacts_view',
    value: 'map',
  },
];
const mocks = {
  Contacts: {
    contacts: {
      nodes: [
        {
          name: 'Contact 1',
          status: StatusEnum.PartnerFinancial,
          primaryAddress: {
            geo: '10,20',
            createdAt: '2021-01-01',
          },
        } as ContactRowFragment,
      ],
    },
  },
  UserOption: {
    userOption: userOptions[0],
  },
  ContactFilters: {
    userOptions,
  },
};

const mapData = coordinatesFromContacts(
  {
    nodes: [...mocks.Contacts.contacts.nodes],
    pageInfo: { endCursor: 'Mg', hasNextPage: false },
    totalCount: 1,
  },
  'en-US',
);

describe('ContactsLeftPanel', () => {
  it('pans to the selected contact', async () => {
    const panTo = jest.fn();
    const setZoom = jest.fn();

    const { findByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{ UserOption: UserOptionQuery }> mocks={mocks}>
            <ContactsWrapper>
              <ContactsContext.Provider
                value={
                  {
                    filterData: undefined,
                    filtersLoading: false,
                    savedFilters: [],
                    activeFilters: {},
                    toggleFilterPanel: jest.fn(),
                    setActiveFilters: jest.fn(),
                    mapRef: {
                      current: {
                        panTo,
                        setZoom,
                      } as unknown as google.maps.Map,
                    },
                    mapData,
                    panTo,
                    selected: null,
                    setSelected: jest.fn(),
                    viewMode: TableViewModeEnum.Map,
                  } as unknown as ContactsType
                }
              >
                <ContactsLeftPanel />
              </ContactsContext.Provider>
            </ContactsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    userEvent.click(await findByText('Contact 1'));
    expect(panTo).toHaveBeenCalledWith({ lat: 10, lng: 20 });
  });
});
