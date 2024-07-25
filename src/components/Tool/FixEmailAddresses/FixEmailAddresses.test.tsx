import React from 'react';
import { ApolloCache, InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap, ErgonoMockShape } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  GetInvalidEmailAddressesQuery,
  UpdateEmailAddressesMutation,
  UpdatePeopleMutation,
} from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
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

jest.mock('src/hooks/useGetAppSettings');

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
    <SnackbarProvider>
      <TestRouter router={router}>
        <TestWrapper>
          <GqlMockedProvider<{
            GetInvalidEmailAddresses: GetInvalidEmailAddressesQuery;
            EmailAddresses: EmailAddressesMutation;
            UpdateEmailAddresses: UpdateEmailAddressesMutation;
            UpdatePeople: UpdatePeopleMutation;
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
    </SnackbarProvider>
  </ThemeProvider>
);

describe('FixPhoneNumbers-Home', () => {
  beforeEach(() => {
    (useGetAppSettings as jest.Mock).mockReturnValue({ appName: 'MPDX' });
  });

  describe('render', () => {
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

    it('should show the app name as a source value', async () => {
      (useGetAppSettings as jest.Mock).mockReturnValue({
        appName: 'OtherThing',
      });

      const { getByRole, getByText } = render(<Components />);
      await waitFor(() => {
        expect(getByText('Fix Email Addresses')).toBeInTheDocument();
        expect(getByText('Confirm 2 as OtherThing')).toBeInTheDocument();
        expect(getByRole('combobox')).toHaveDisplayValue('OtherThing');
      });
    });
  });

  describe('handleChangePrimary()', () => {
    it('changes primary of first email', async () => {
      const { getByTestId, queryByTestId } = render(<Components />);

      const star1 = await waitFor(() =>
        getByTestId('starOutlineIcon-testid-1'),
      );
      userEvent.click(star1);

      expect(queryByTestId('starIcon-testid-0')).not.toBeInTheDocument();
      expect(getByTestId('starIcon-testid-1')).toBeInTheDocument();
      expect(getByTestId('starOutlineIcon-testid-0')).toBeInTheDocument();
    });

    it('should choose primary and deselect primary from others', async () => {
      const { getByTestId, queryByTestId } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: [
                  {
                    ...mockInvalidEmailAddressesResponse[0],
                    emailAddresses: {
                      nodes: [
                        {
                          ...contactOneEmailAddressNodes[0],
                          primary: true,
                        },
                        {
                          ...contactOneEmailAddressNodes[1],
                          primary: true,
                        },
                        {
                          ...contactOneEmailAddressNodes[2],
                          primary: true,
                        },
                      ],
                    },
                  },
                  {
                    ...mockInvalidEmailAddressesResponse[1],
                  },
                ],
              },
            },
          }}
        />,
      );

      let newPrimary;
      await waitFor(() => {
        expect(getByTestId('starIcon-testid-0')).toBeInTheDocument();
        expect(getByTestId('starIcon-testid-1')).toBeInTheDocument();
        newPrimary = getByTestId('starIcon-testid-2');
        expect(newPrimary).toBeInTheDocument();
      });
      userEvent.click(newPrimary);

      await waitFor(() => {
        expect(queryByTestId('starIcon-testid-0')).not.toBeInTheDocument();
        expect(queryByTestId('starIcon-testid-1')).not.toBeInTheDocument();
        expect(getByTestId('starIcon-testid-2')).toBeInTheDocument();
        expect(getByTestId('starOutlineIcon-testid-0')).toBeInTheDocument();
        expect(getByTestId('starOutlineIcon-testid-1')).toBeInTheDocument();
        expect(
          queryByTestId('starOutlineIcon-testid-2'),
        ).not.toBeInTheDocument();
      });
    });
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

  describe('handleSingleConfirm', () => {
    it('should successfully submit changes to multiple emails', async () => {
      const cache = new InMemoryCache();
      const personName = 'Test Contact';

      const updatePerson = {
        person: {
          id: mockInvalidEmailAddressesResponse[0].id,
          emailAddresses: {
            nodes: [
              {
                ...contactOneEmailAddressNodes[0],
                email: 'different@email.com',
              },
              {
                ...contactOneEmailAddressNodes[1],
                email: 'different2@email.com',
              },
              {
                ...contactOneEmailAddressNodes[2],
              },
            ],
          },
        },
      } as ErgonoMockShape;

      const { getAllByRole, queryByTestId, queryByText } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
            UpdateEmailAddresses: { updatePerson },
          }}
          cache={cache}
        />,
      );

      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      const confirmButton = getAllByRole('button', { name: 'Confirm' })[0];
      userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Successfully updated email addresses for ${personName}`,
          { variant: 'success' },
        );
        expect(queryByText(personName)).not.toBeInTheDocument();
      });
    });

    it('should handle an error', async () => {
      const cache = new InMemoryCache();

      const { getAllByRole, queryByTestId } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
            UpdateEmailAddresses: () => {
              throw new Error('Server Error');
            },
          }}
          cache={cache}
        />,
      );

      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      const confirmButton = getAllByRole('button', { name: 'Confirm' })[0];
      userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Error updating email addresses for Test Contact',
          { variant: 'error', autoHideDuration: 7000 },
        );
      });
    });
  });

  describe('handleBulkConfirm', () => {
    it('should save all the email changes for all people', async () => {
      const cache = new InMemoryCache();
      const noPeopleMessage = 'No people with email addresses need attention';

      const { getByRole, getByText, queryByTestId } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
          }}
          cache={cache}
        />,
      );

      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      const bulkConfirmButton = getByRole('button', {
        name: 'Confirm 2 as MPDX',
      });
      userEvent.click(bulkConfirmButton);
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Successfully updated email addresses`,
          { variant: 'success' },
        );
        expect(getByText(noPeopleMessage)).toBeVisible();
      });
    });

    it('should handle errors', async () => {
      const cache = new InMemoryCache();
      const personName1 = 'Test Contact';
      const personName2 = 'Simba Lion';

      const { getByRole, getByText, queryByTestId } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
            UpdatePeople: () => {
              throw new Error('Server error');
            },
          }}
          cache={cache}
        />,
      );

      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      const bulkConfirmButton = getByRole('button', {
        name: 'Confirm 2 as MPDX',
      });
      userEvent.click(bulkConfirmButton);
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Error updating email addresses`,
          { variant: 'error', autoHideDuration: 7000 },
        );
        expect(getByText(personName1)).toBeVisible();
        expect(getByText(personName2)).toBeVisible();
      });
    });

    it('should cancel the bulk confirmation', async () => {
      const cache = new InMemoryCache();
      const personName1 = 'Test Contact';
      const personName2 = 'Simba Lion';

      const { getByRole, getByText, queryByTestId } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
          }}
          cache={cache}
        />,
      );

      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      const bulkConfirmButton = getByRole('button', {
        name: 'Confirm 2 as MPDX',
      });
      userEvent.click(bulkConfirmButton);
      userEvent.click(getByRole('button', { name: 'No' }));

      await waitFor(() => {
        expect(mockEnqueue).not.toHaveBeenCalled();
        expect(getByText(personName1)).toBeVisible();
        expect(getByText(personName2)).toBeVisible();
      });
    });
  });
});
