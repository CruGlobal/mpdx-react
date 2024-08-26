import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AppealsContext } from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import { DeleteAppealContactModal } from './DeleteAppealContactModal';

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

const accountListId = 'abc';
const appealId = 'appealId';
const contactId = 'contact-1';
const appealContactId = 'appealContactId';
const router = {
  query: { accountListId },
  isReady: true,
};
const handleClose = jest.fn();
const mutationSpy = jest.fn();
const refetch = jest.fn();

interface ComponentsProps {
  contact?: AppealContactInfoFragment;
}

const Components = ({}: ComponentsProps) => {
  let cardinality = 0;
  return (
    <I18nextProvider i18n={i18n}>
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <ThemeProvider theme={theme}>
              <TestRouter router={router}>
                <GqlMockedProvider
                  mocks={{
                    AppealContacts: () => {
                      let mutationResponse;
                      if (cardinality < 3) {
                        mutationResponse = {
                          appealContacts: {
                            nodes: [
                              {
                                id: `id1${cardinality}`,
                                contact: {
                                  id: `contactId1${cardinality}`,
                                },
                              },
                              {
                                id: `id2${cardinality}`,
                                contact: {
                                  id: `contactId2${cardinality}`,
                                },
                              },
                              {
                                id: `id3${cardinality}`,
                                contact: {
                                  id: `contactId3${cardinality}`,
                                },
                              },
                            ],
                            pageInfo: {
                              hasNextPage: true,
                              endCursor: 'endCursor',
                            },
                          },
                        };
                      } else {
                        mutationResponse = {
                          appealContacts: {
                            nodes: [
                              {
                                id: appealContactId,
                                contact: {
                                  id: contactId,
                                },
                              },
                              {
                                id: `id5${cardinality}`,
                                contact: {
                                  id: `contactId5${cardinality}`,
                                },
                              },
                              {
                                id: `id6${cardinality}`,
                                contact: {
                                  id: `contactId6${cardinality}`,
                                },
                              },
                            ],
                            pageInfo: {
                              hasNextPage: false,
                              endCursor: 'endCursor',
                            },
                          },
                        };
                      }
                      cardinality++;
                      return mutationResponse;
                    },
                  }}
                  onCall={mutationSpy}
                >
                  <AppealsWrapper>
                    <AppealsContext.Provider
                      value={{
                        accountListId,
                        appealId: appealId,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        contactsQueryResult: { refetch },
                        filterPanelOpen: false,
                      }}
                    >
                      <DeleteAppealContactModal
                        handleClose={handleClose}
                        contactId={contactId}
                      />
                    </AppealsContext.Provider>
                  </AppealsWrapper>
                </GqlMockedProvider>
              </TestRouter>
            </ThemeProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </SnackbarProvider>
    </I18nextProvider>
  );
};

describe('DeleteAppealContactModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
    refetch.mockClear();
  });
  it('default', () => {
    const { getByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Remove Contact' }),
    ).toBeInTheDocument();

    expect(getByRole('button', { name: 'No' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Yes' })).toBeInTheDocument();
  });

  it('should close modal', () => {
    const { getByRole } = render(<Components />);

    expect(handleClose).toHaveBeenCalledTimes(0);
    userEvent.click(getByRole('button', { name: 'No' }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('fetches all the appealContacts and matches up the correct ID to send to the API', async () => {
    const { getByRole } = render(<Components />);

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalledTimes(8);
    });

    // Call AppealContacts 4 times getting all contacts.
    expect(mutationSpy.mock.calls[0][0].operation.operationName).toEqual(
      'AppealContacts',
    );
    expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
      'AppealContacts',
    );
    expect(mutationSpy.mock.calls[5][0].operation.operationName).toEqual(
      'AppealContacts',
    );
    expect(mutationSpy.mock.calls[6][0].operation.operationName).toEqual(
      'AppealContacts',
    );

    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully remove contact from appeal.',
        {
          variant: 'success',
        },
      );
    });

    await waitFor(() => {
      expect(mutationSpy.mock.calls[8][0].operation.operationName).toEqual(
        'DeleteAppealContact',
      );
      expect(mutationSpy.mock.calls[8][0].operation.variables).toEqual({
        input: {
          id: 'appealContactId',
        },
      });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
