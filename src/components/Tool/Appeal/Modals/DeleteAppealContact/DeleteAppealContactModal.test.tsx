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
import {
  AppealsContext,
  AppealsType,
  TableViewModeEnum,
} from '../../AppealsContext/AppealsContext';
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

interface ComponentsProps {
  viewMode?: TableViewModeEnum;
}

const Components = ({ viewMode = TableViewModeEnum.List }: ComponentsProps) => {
  let requestCount = 0;
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
                      if (requestCount < 3) {
                        mutationResponse = {
                          appealContacts: {
                            nodes: [
                              {
                                id: `id1${requestCount}`,
                                contact: {
                                  id: `contactId1${requestCount}`,
                                },
                              },
                              {
                                id: `id2${requestCount}`,
                                contact: {
                                  id: `contactId2${requestCount}`,
                                },
                              },
                              {
                                id: `id3${requestCount}`,
                                contact: {
                                  id: `contactId3${requestCount}`,
                                },
                              },
                            ],
                            pageInfo: {
                              hasNextPage: true,
                              endCursor: `endCursor${requestCount}`,
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
                                id: `id5${requestCount}`,
                                contact: {
                                  id: `contactId5${requestCount}`,
                                },
                              },
                              {
                                id: `id6${requestCount}`,
                                contact: {
                                  id: `contactId6${requestCount}`,
                                },
                              },
                            ],
                            pageInfo: {
                              hasNextPage: false,
                              endCursor: 'endCursor3',
                            },
                          },
                        };
                      }
                      requestCount++;
                      return mutationResponse;
                    },
                    GetContactIdsForMassSelection: {
                      contacts: {
                        nodes: [
                          { id: '01' },
                          { id: '02' },
                          { id: '03' },
                          { id: '04' },
                          { id: '05' },
                          { id: '06' },
                        ],
                      },
                    },
                  }}
                  onCall={mutationSpy}
                >
                  <AppealsWrapper>
                    <AppealsContext.Provider
                      value={
                        {
                          accountListId,
                          appealId: appealId,
                          filterPanelOpen: false,
                          viewMode,
                        } as unknown as AppealsType
                      }
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

  it('should successfully delete a contact from an appeal', async () => {
    const { getByRole } = render(<Components />);

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
      expect(mutationSpy).toHaveGraphqlOperation('DeleteAppealContact', {
        input: {
          contactId: 'contact-1',
          appealId: 'appealId',
        },
      });
    });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
