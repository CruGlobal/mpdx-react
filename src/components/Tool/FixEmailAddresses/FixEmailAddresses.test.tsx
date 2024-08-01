import React from 'react';
import { ApolloCache, InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap, ErgonoMockShape } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetInvalidEmailAddressesQuery } from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses.generated';
import theme from '../../../theme';
import { EmailAddressesMutation } from './AddEmailAddress.generated';
import { FixEmailAddresses } from './FixEmailAddresses';
import {
  contactId,
  contactOneEmailAddressNodes,
  contactTwoEmailAddressNodes,
  mockCacheWriteData,
  mockCacheWriteDataContactTwo,
  mockInvalidEmailAddressesResponse,
  newEmail,
} from './FixEmailAddressesMocks';

const accountListId = 'accountListId';
const router = {
  query: { accountListId },
  isReady: true,
};

const setContactFocus = jest.fn();
const mutationSpy = jest.fn();
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

const defaultGraphQLMock = {
  GetInvalidEmailAddresses: {
    people: { nodes: mockInvalidEmailAddressesResponse },
  },
};

interface ComponentsProps {
  mocks?: ApolloErgonoMockMap;
  cache?: ApolloCache<object>;
}

const Components = ({ mocks = defaultGraphQLMock, cache }: ComponentsProps) => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{
          GetInvalidEmailAddresses: GetInvalidEmailAddressesQuery;
          EmailAddresses: EmailAddressesMutation;
        }>
          mocks={mocks}
          cache={cache}
          onCall={mutationSpy}
        >
          <FixEmailAddresses
            accountListId={accountListId}
            setContactFocus={setContactFocus}
          />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('FixEmailAddresses-Home', () => {
  it('default with test data', async () => {
    const { getByText, getByTestId, queryByTestId } = render(<Components />);

    await waitFor(() =>
      expect(getByText('Fix Email Addresses')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(getByTestId('starOutlineIcon-testid-1')).toBeInTheDocument(),
    );
    await expect(
      getByText('You have 2 email addresses to confirm.'),
    ).toBeInTheDocument();
    expect(getByText('Confirm 2 as MPDX')).toBeInTheDocument();
    expect(getByText('Test Contact')).toBeInTheDocument();
    expect(getByText('Simba Lion')).toBeInTheDocument();
    expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    expect(getByTestId('starIcon-testid-0')).toBeInTheDocument();
    expect(queryByTestId('no-data')).not.toBeInTheDocument();
  });

  it('change primary of first email', async () => {
    const { getByTestId, queryByTestId } = render(<Components />);

    const star1 = await waitFor(() => getByTestId('starOutlineIcon-testid-1'));
    userEvent.click(star1);

    expect(queryByTestId('starIcon-testid-0')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-testid-1')).toBeInTheDocument();
    expect(getByTestId('starOutlineIcon-testid-0')).toBeInTheDocument();
  });

  it('should add an new email address, firing a GraphQL mutation and resetting the form', async () => {
    const { getByTestId, getAllByLabelText } = render(<Components />);
    await waitFor(() => {
      expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    });
    const textFieldNew = getAllByLabelText('New Email Address')[0];
    userEvent.type(textFieldNew, newEmail.email);
    const addButton = getByTestId('addButton-testid');
    expect(textFieldNew).toHaveValue(newEmail.email);

    userEvent.click(addButton);

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Added email address', {
        variant: 'success',
      }),
    );

    expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
      'EmailAddresses',
    );
    expect(mutationSpy.mock.calls[1][0].operation.variables).toEqual({
      input: {
        accountListId: accountListId,
        attributes: {
          id: 'testid',
          emailAddresses: [{ email: newEmail.email }],
        },
      },
    });
    expect(textFieldNew).toHaveValue('');
  });

  //TODO: Fix during MPDX-7936
  it.skip('delete third email from first person', async () => {
    const { getByTestId, queryByTestId } = render(<Components />);

    const delete02 = await waitFor(() => getByTestId('delete-testid-2'));
    userEvent.click(delete02);

    const deleteButton = getByTestId('modal-delete-button');
    userEvent.click(deleteButton);

    expect(queryByTestId('textfield-testid-2')).not.toBeInTheDocument();
  });

  //TODO: Fix during MPDX-7936
  it.skip('change second email for second person to primary then delete it', async () => {
    const { getByTestId, queryByTestId } = render(<Components />);

    const star11 = await waitFor(() =>
      getByTestId('starOutlineIcon-testid2-1'),
    );
    userEvent.click(star11);

    const delete11 = getByTestId('delete-testid2-1');
    userEvent.click(delete11);

    const deleteButton = getByTestId('modal-delete-button');
    userEvent.click(deleteButton);

    expect(queryByTestId('starIcon-testid2-1')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-testid2-0')).toBeInTheDocument();
  });

  it('should render no contacts with no data', async () => {
    const { getByText, getByTestId } = render(
      <Components
        mocks={{
          GetInvalidEmailAddresses: {
            people: { nodes: [] },
          },
        }}
      />,
    );
    await waitFor(() =>
      expect(getByTestId('fixEmailAddresses-null-state')).toBeInTheDocument(),
    );
    expect(
      getByText('No people with email addresses need attention'),
    ).toBeInTheDocument();
  });

  it('should modify first email of first contact', async () => {
    const { getByTestId } = render(<Components />);
    await waitFor(() => {
      expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    });
    const firstInput = getByTestId('textfield-testid-0');

    expect(firstInput).toHaveValue('email1@gmail.com');
    userEvent.type(firstInput, '123');
    expect(firstInput).toHaveValue('email1@gmail.com123');
  });

  describe('setContactFocus()', () => {
    it('should open up contact details', async () => {
      const { getByText, queryByTestId } = render(<Components />);
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );
      expect(setContactFocus).not.toHaveBeenCalled();

      const contactName = getByText('Test Contact');

      expect(contactName).toBeInTheDocument();
      userEvent.click(contactName);
      expect(setContactFocus).toHaveBeenCalledWith(contactId);
    });
  });

  describe('Add email address - Testing cache', () => {
    interface AddEmailAddressProps {
      postSaveResponse: object;
      emailAddressNodes: object[];
      elementToWaitFor: string;
      textFieldIndex: number;
      addButtonId: string;
      cache: InMemoryCache;
    }

    const addEmailAddress = async ({
      postSaveResponse,
      emailAddressNodes,
      elementToWaitFor,
      textFieldIndex,
      addButtonId,
      cache,
    }: AddEmailAddressProps) => {
      let cardinality = 0;
      jest.spyOn(cache, 'readQuery').mockReturnValue(postSaveResponse);
      jest.spyOn(cache, 'writeQuery');

      const updatePerson = {
        person: {
          emailAddresses: {
            nodes: [
              ...emailAddressNodes,
              {
                email: newEmail.email,
              },
            ],
          },
        },
      } as ErgonoMockShape;

      const { getByTestId, getAllByLabelText } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: () => {
              let queryResult;
              if (cardinality === 0) {
                queryResult = {
                  people: {
                    nodes: mockInvalidEmailAddressesResponse,
                  },
                };
              } else {
                queryResult = postSaveResponse;
              }
              cardinality++;
              return queryResult;
            },
            EmailAddresses: { updatePerson },
          }}
          cache={cache}
        />,
      );
      await waitFor(() => {
        expect(getByTestId(elementToWaitFor)).toBeInTheDocument();
      });

      const textFieldNew =
        getAllByLabelText('New Email Address')[textFieldIndex];
      userEvent.type(textFieldNew, newEmail.email);
      const addButton = getByTestId(addButtonId);
      userEvent.click(addButton);
    };

    it('should add an email address to the first person', async () => {
      const cache = new InMemoryCache();
      const postSaveResponse = {
        people: {
          nodes: [
            {
              ...mockInvalidEmailAddressesResponse[0],
              emailAddresses: {
                nodes: [...contactOneEmailAddressNodes, newEmail],
              },
            },
            { ...mockInvalidEmailAddressesResponse[1] },
          ],
        },
      };
      await addEmailAddress({
        postSaveResponse,
        emailAddressNodes: contactOneEmailAddressNodes,
        elementToWaitFor: 'textfield-testid-0',
        textFieldIndex: 0,
        addButtonId: 'addButton-testid',
        cache,
      });

      await waitFor(() => {
        expect(cache.writeQuery).toHaveBeenLastCalledWith(
          expect.objectContaining({ data: mockCacheWriteData }),
        );
      });
    });

    it('should add an email address to the second person', async () => {
      const cache = new InMemoryCache();
      const postSaveResponse = {
        people: {
          nodes: [
            { ...mockInvalidEmailAddressesResponse[0] },
            {
              ...mockInvalidEmailAddressesResponse[1],
              emailAddresses: {
                nodes: [...contactTwoEmailAddressNodes, newEmail],
              },
            },
          ],
        },
      };
      await addEmailAddress({
        postSaveResponse,
        emailAddressNodes: contactTwoEmailAddressNodes,
        elementToWaitFor: 'textfield-testid2-0',
        textFieldIndex: 1,
        addButtonId: 'addButton-testid2',
        cache,
      });

      await waitFor(() => {
        expect(cache.writeQuery).toHaveBeenLastCalledWith(
          expect.objectContaining({ data: mockCacheWriteDataContactTwo }),
        );
      });
    });
  });
});
