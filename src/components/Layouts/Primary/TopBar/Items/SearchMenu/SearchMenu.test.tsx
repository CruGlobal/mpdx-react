import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { StatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import SearchMenu from './SearchMenu';
import { GetSearchMenuContactsQuery } from './SearchMenu.generated';

const router = {
  pathname: '/accountLists/[accountListId]',
  query: { accountListId: '1' },
  push: jest.fn(),
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

describe('SearchMenu', () => {
  it('default', async () => {
    const { getByRole, getByPlaceholderText } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <SearchMenu />
          </TestRouter>
        </ThemeProvider>
      </GqlMockedProvider>,
    );
    userEvent.click(getByRole('button'));
    await waitFor(() =>
      expect(
        getByPlaceholderText('Type something to start searching'),
      ).toBeInTheDocument(),
    );
  });

  it('handles searching', async () => {
    const { getByRole, getByPlaceholderText, getByText } = render(
      <I18nextProvider i18n={i18n}>
        <GqlMockedProvider<{
          GetSearchMenuContacts: GetSearchMenuContactsQuery;
        }>
          mocks={{
            GetSearchMenuContacts: {
              contacts: {
                nodes: [
                  {
                    name: 'Cool, Guy',
                    status: StatusEnum.AskInFuture,
                    id: '123',
                  },
                  {
                    name: 'Cool, Dude',
                    status: StatusEnum.CallForDecision,
                    id: '1234',
                  },
                  {
                    name: 'Cool, One',
                    status: StatusEnum.CallForDecision,
                    id: '12341',
                  },
                  {
                    name: 'Cool, Two',
                    status: StatusEnum.CallForDecision,
                    id: '12342',
                  },
                  {
                    name: 'Cool, Three',
                    status: StatusEnum.CallForDecision,
                    id: '12343',
                  },
                ],
                totalCount: 8,
              },
            },
          }}
        >
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <SearchMenu />
            </TestRouter>
          </ThemeProvider>
        </GqlMockedProvider>
      </I18nextProvider>,
    );

    userEvent.click(getByRole('button'));
    await waitFor(() =>
      expect(
        getByPlaceholderText('Type something to start searching'),
      ).toBeInTheDocument(),
    );
    userEvent.type(
      getByPlaceholderText('Type something to start searching'),
      'Cool',
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await waitFor(() => expect(getByText('Cool, Guy')).toBeVisible());
    await waitFor(() => expect(getByText('Cool, Dude')).toBeVisible());
    await waitFor(() => expect(getByText('And 3 more')).toBeVisible());
    expect(getByText('Create a new contact for "Cool"')).toBeVisible();
  });

  it('handles clicking search result', async () => {
    const { getByRole, getByPlaceholderText, getByText } = render(
      <I18nextProvider i18n={i18n}>
        <GqlMockedProvider<{
          GetSearchMenuContacts: GetSearchMenuContactsQuery;
        }>
          mocks={{
            GetSearchMenuContacts: {
              contacts: {
                nodes: [
                  {
                    name: 'Cool, Guy',
                    status: StatusEnum.AskInFuture,
                    id: '123',
                  },
                  {
                    name: 'Cool, Dude',
                    status: StatusEnum.CallForDecision,
                    id: '1234',
                  },
                ],
              },
            },
          }}
        >
          <ThemeProvider theme={theme}>
            <TestRouter router={router}>
              <SearchMenu />
            </TestRouter>
          </ThemeProvider>
        </GqlMockedProvider>
      </I18nextProvider>,
    );

    userEvent.click(getByRole('button'));
    await waitFor(() =>
      expect(
        getByPlaceholderText('Type something to start searching'),
      ).toBeInTheDocument(),
    );
    userEvent.type(
      getByPlaceholderText('Type something to start searching'),
      'Cool',
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await waitFor(() => expect(getByText('Cool, Guy')).toBeVisible());
    await waitFor(() => expect(getByText('Cool, Dude')).toBeVisible());
    expect(getByText('Create a new contact for "Cool"')).toBeVisible();
    userEvent.click(getByText('Cool, Guy'));
    await waitFor(() => expect(router.push).toHaveBeenCalled());
  });
});

it('handles creating a new contact', async () => {
  const { getByRole, getByPlaceholderText, getByText } = render(
    <I18nextProvider i18n={i18n}>
      <GqlMockedProvider<{ GetSearchMenuContacts: GetSearchMenuContactsQuery }>
        mocks={{
          GetSearchMenuContacts: {
            contacts: {
              nodes: [
                {
                  name: 'Cool, Guy',
                  status: StatusEnum.AskInFuture,
                  id: '123',
                },
                {
                  name: 'Cool, Dude',
                  status: StatusEnum.CallForDecision,
                  id: '1234',
                },
              ],
            },
          },
          CreateContact: {
            createContact: {
              contact: {
                id: 'abc123',
              },
            },
          },
        }}
      >
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <SearchMenu />
          </TestRouter>
        </ThemeProvider>
      </GqlMockedProvider>
    </I18nextProvider>,
  );

  userEvent.click(getByRole('button'));
  await waitFor(() =>
    expect(
      getByPlaceholderText('Type something to start searching'),
    ).toBeInTheDocument(),
  );
  userEvent.type(
    getByPlaceholderText('Type something to start searching'),
    'Neat',
  );

  expect(getByText('Create a new contact for "Neat"')).toBeVisible();
  userEvent.click(getByText('Create a new contact for "Neat"'));
  await waitFor(() =>
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/accountLists/[accountListId]/contacts/[contactId]',
      query: {
        accountListId: '1',
        contactId: 'abc123',
      },
    }),
  );
  expect(mockEnqueue).toHaveBeenCalledWith('Contact successfully created', {
    variant: 'success',
  });
});
