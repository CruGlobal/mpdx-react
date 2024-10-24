import { useContext, useEffect } from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import theme from 'src/theme';
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
    id: 'test-id',
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
          primaryAddress: {
            geo: '10,20',
          },
        },
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

describe('ContactsLeftPanel', () => {
  it('pans to the selected contact', async () => {
    const panTo = jest.fn();
    const setZoom = jest.fn();
    const Component = () => {
      const { mapRef } = useContext(ContactsContext) as ContactsType;

      useEffect(() => {
        mapRef.current = {
          panTo,
          setZoom,
        } as unknown as google.maps.Map;
      }, []);

      return null;
    };

    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider<{ UserOption: UserOptionQuery }> mocks={mocks}>
            <ContactsWrapper>
              <>
                <Component />
                <ContactsLeftPanel />
              </>
            </ContactsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() => expect(getByText('Contact 1')).toBeInTheDocument());

    userEvent.click(getByText('Contact 1'));
    expect(panTo).toHaveBeenCalledWith({ lat: 10, lng: 20 });
  });
});
