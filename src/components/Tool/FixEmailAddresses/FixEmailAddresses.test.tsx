import React from 'react';
import { ApolloCache, InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap, ErgonoMockShape } from 'graphql-ergonomock';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetInvalidEmailAddressesQuery } from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses.generated';
import theme from '../../../theme';
import { EmailAddressesMutation } from './AddEmailAddress.generated';
import { FixEmailAddresses } from './FixEmailAddresses';
import {
  contactId,
  contactOneEmailAddressNodes,
  contactTwoEmailAddressNodes,
  mockInvalidEmailAddressesResponse,
  newEmail,
} from './FixEmailAddressesMocks';

const accountListId = 'test121';
const router = {
  query: { accountListId },
  isReady: true,
};

const setContactFocus = jest.fn();

const Components = ({
  mocks = {
    GetInvalidEmailAddresses: {
      people: { nodes: mockInvalidEmailAddressesResponse },
    },
  },
  cache,
}: {
  mocks?: ApolloErgonoMockMap;
  cache?: ApolloCache<object>;
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <TestWrapper>
        <GqlMockedProvider<{
          GetInvalidEmailAddresses: GetInvalidEmailAddressesQuery;
          EmailAddresses: EmailAddressesMutation;
        }>
          mocks={mocks}
          cache={cache}
        >
          <FixEmailAddresses
            accountListId={accountListId}
            setContactFocus={setContactFocus}
          />
        </GqlMockedProvider>
      </TestWrapper>
    </TestRouter>
  </ThemeProvider>
);

describe('FixPhoneNumbers-Home', () => {
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

  it('delete third email from first person', async () => {
    const { getByTestId, queryByTestId } = render(<Components />);

    const delete02 = await waitFor(() => getByTestId('delete-testid-2'));
    userEvent.click(delete02);

    const deleteButton = await waitFor(() =>
      getByTestId('modal-delete-button'),
    );
    userEvent.click(deleteButton);

    await waitFor(() => {
      expect(queryByTestId('textfield-testid-2')).not.toBeInTheDocument();
    });
  });

  it('change second email for second person to primary then delete it', async () => {
    const { getByTestId, queryByTestId } = render(<Components />);

    const star11 = await waitFor(() =>
      getByTestId('starOutlineIcon-testid2-1'),
    );
    userEvent.click(star11);

    const delete11 = await waitFor(() => getByTestId('delete-testid2-1'));
    userEvent.click(delete11);

    const deleteButton = await waitFor(() =>
      getByTestId('modal-delete-button'),
    );
    userEvent.click(deleteButton);

    await waitFor(() => {
      expect(queryByTestId('starIcon-testid2-1')).not.toBeInTheDocument();
      expect(getByTestId('starIcon-testid2-0')).toBeInTheDocument();
    });
  });

  describe('add email address', () => {
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
                ...newEmail,
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
          expect.objectContaining({ data: postSaveResponse }),
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
          expect.objectContaining({ data: postSaveResponse }),
        );
      });
    });
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
});
