import { ApolloCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MassActionsUpdateContactsMutation } from 'src/components/Contacts/MassActions/MassActionsUpdateContacts.generated';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import FixSendNewsletter from './FixSendNewsletter';
import {
  mockInvalidNewslettersResponse,
  mockMassActionsUpdateContactsData,
  mockUploadNewsletterChange,
} from './FixSendNewsletterMock';
import { InvalidNewsletterQuery } from './InvalidNewsletter.generated';
import { UpdateContactNewsletterMutation } from './UpdateNewsletter.generated';

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

const accountListId = 'account-id';
const router = {
  isReady: true,
};

const TestComponent = ({
  mocks,
  cache,
  onCall,
}: {
  mocks: ApolloErgonoMockMap;
  cache?: ApolloCache<object>;
  onCall?: MockLinkCallHandler;
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          InvalidNewsletter: InvalidNewsletterQuery;
          UpdateContactNewsletter: UpdateContactNewsletterMutation;
          MassActionsUpdateContacts: MassActionsUpdateContactsMutation;
        }>
          mocks={mocks}
          cache={cache}
          onCall={onCall}
        >
          <FixSendNewsletter accountListId={accountListId} />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('FixSendNewsletter', () => {
  const contacts =
    mockInvalidNewslettersResponse.InvalidNewsletter.contacts.nodes;
  const deceasedName = contacts[2].name;
  const firstContactName = contacts[0].name;
  const secondContactName = contacts[1].name;
  const initialNewsletterValue = 'None';
  const newNewsletterValue = 'Physical';

  describe('render', () => {
    it('should show the readable value of contact status', async () => {
      const { getByText } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(getByText('Partner - Pray')).toBeVisible();
      });
    });

    it('should show the confirm button', async () => {
      const { getAllByRole } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(getAllByRole('button', { name: 'Confirm' })[0]).toBeVisible();
      });
    });

    it('should show the confirm all button', async () => {
      const { getByRole } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(getByRole('button', { name: 'Confirm All (2)' })).toBeVisible();
      });
    });

    it('should not show deceased contacts', async () => {
      const { queryByRole, queryByText } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );
      await waitFor(() => {
        expect(queryByText(deceasedName)).not.toBeInTheDocument();
      });
    });
  });

  describe('confirm single', () => {
    it('should successfully update the newsletter', async () => {
      const mutationSpy = jest.fn();

      const { getAllByRole, queryByText, queryByRole, getByText } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
            UpdateContactNewsletter: {
              ...mockUploadNewsletterChange.UpdateContactNewsletter,
            },
          }}
          onCall={mutationSpy}
        />,
      );
      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      const newsletterDropdown = getAllByRole('combobox')[0];
      await waitFor(() => {
        expect(
          within(newsletterDropdown).getByText('Both'),
        ).toBeInTheDocument();
        userEvent.click(newsletterDropdown);
        userEvent.click(getByText(newNewsletterValue));
      });
      expect(queryByText(firstContactName)).toBeInTheDocument();
      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);
      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith('Newsletter updated!', {
          variant: 'success',
        });
      });
      await waitFor(() => {
        expect(mutationSpy.mock.calls[1][0]).toMatchObject({
          operation: {
            operationName: 'UpdateContactNewsletter',
            variables: {
              accountListId: 'account-id',
              attributes: {
                sendNewsletter: 'PHYSICAL',
              },
            },
          },
        });
        expect(queryByText(secondContactName)).toBeInTheDocument();
      });
    });

    it('should handle an error', async () => {
      const { getAllByRole, queryByRole } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
            UpdateContactNewsletter: () => {
              throw new Error('Server Error');
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Error updating contact ${firstContactName}`,
          {
            variant: 'error',
            autoHideDuration: 7000,
          },
        );
      });
    });

    it('should filter out deceased', async () => {
      const { getAllByRole, queryByText, queryByRole, getByText } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
            UpdateContactNewsletter: {
              ...mockUploadNewsletterChange.UpdateContactNewsletter,
            },
          }}
        />,
      );
      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      const newsletterDropdown = getAllByRole('combobox')[0];
      userEvent.click(newsletterDropdown);
      userEvent.click(getByText(newNewsletterValue));
      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);
      await waitFor(() => {
        expect(queryByText(deceasedName)).not.toBeInTheDocument();
        expect(queryByText(secondContactName)).toBeInTheDocument();
      });
    });
  });

  describe('bulk confirm', () => {
    const secondContactNewNewsletterValue = 'Both';

    const confirmAll = async (
      getAllByRole,
      getByRole,
      queryByRole,
      getByText,
    ) => {
      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      const firstNewsletterDropdown = getAllByRole('combobox')[0];
      await waitFor(() => {
        expect(
          within(firstNewsletterDropdown).getByText(initialNewsletterValue),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        userEvent.click(firstNewsletterDropdown);
        userEvent.click(getByRole('option', { name: newNewsletterValue }));
      });
      const secondNewsletterDropdown = getAllByRole('combobox')[1];
      await waitFor(() => {
        expect(
          within(secondNewsletterDropdown).getByText(initialNewsletterValue),
        ).toBeInTheDocument();
      });

      userEvent.click(secondNewsletterDropdown);
      userEvent.click(
        getByRole('option', { name: secondContactNewNewsletterValue }),
      );
      userEvent.click(getByText('Confirm All (2)'));
      userEvent.click(getByRole('button', { name: 'Yes' }));
    };

    it('should bring up the confirmation modal', async () => {
      const { getByRole, getByText, queryByRole } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
            UpdateContactNewsletter: {
              ...mockUploadNewsletterChange.UpdateContactNewsletter,
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      userEvent.click(getByRole('button', { name: 'Confirm All (2)' }));

      await waitFor(() => {
        expect(
          getByText(
            'You are updating all contacts visible on this page, setting it to the visible newsletter selection. Are you sure you want to do this?',
          ),
        ).toBeVisible();
      });
    });

    it('should successfully update all the contacts', async () => {
      let cardinality = 0;
      const mutationSpy = jest.fn();
      const { getAllByRole, getByRole, queryByRole, getByText } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: () => {
              let queryResult;
              if (cardinality === 0) {
                queryResult = {
                  ...mockInvalidNewslettersResponse.InvalidNewsletter,
                };
              } else {
                queryResult = {
                  contacts: {
                    nodes: [
                      {
                        ...mockInvalidNewslettersResponse.InvalidNewsletter
                          .contacts.nodes[2],
                      },
                    ],
                  },
                };
              }
              cardinality++;
              return queryResult;
            },
            MassActionsUpdateContacts: {
              ...mockMassActionsUpdateContactsData.MassActionsUpdateContacts,
            },
          }}
          onCall={mutationSpy}
        />,
      );
      confirmAll(getAllByRole, getByRole, queryByRole, getByText);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Newsletter statuses updated successfully',
          {
            variant: 'success',
          },
        );
      });
      await waitFor(() => {
        expect(mutationSpy.mock.calls[1][0]).toMatchObject({
          operation: {
            operationName: 'MassActionsUpdateContacts',
            variables: {
              accountListId: 'account-id',
              attributes: [
                {
                  id: 'contactId2',
                  sendNewsletter: SendNewsletterEnum.Both,
                },
                {
                  id: 'contactId1',
                  sendNewsletter: SendNewsletterEnum.Physical,
                },
              ],
            },
          },
        });
      });
    });

    it('should handle errors', async () => {
      const { getAllByRole, getByRole, queryByRole, getByText } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
            MassActionsUpdateContacts: () => {
              throw new Error('Server Error');
            },
          }}
        />,
      );
      confirmAll(getAllByRole, getByRole, queryByRole, getByText);
      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(`Error updating contacts`, {
          variant: 'error',
          autoHideDuration: 7000,
        });
      });
    });
  });
});
