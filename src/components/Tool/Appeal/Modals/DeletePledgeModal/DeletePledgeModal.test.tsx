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
import { PledgeStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AppealsContext } from '../../AppealsContext/AppealsContext';
import { DeletePledgeModal } from './DeletePledgeModal';

const accountListId = 'abc';
const appealId = 'appealId';
const router = {
  query: { accountListId },
  isReady: true,
};
const handleClose = jest.fn();
const mutationSpy = jest.fn();
const refetch = jest.fn();
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

const pledge = {
  id: 'pledge-1',
  appealId: appealId,
  contactId: 'contactId',
  amount: 100,
  currency: 'USD',
  expectedDate: '2020-01-01',
  status: PledgeStatusEnum.NotReceived,
};

const Components = () => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider onCall={mutationSpy}>
              <AppealsWrapper>
                <AppealsContext.Provider
                  value={{
                    accountListId,
                    appealId: appealId,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    contactsQueryResult: { refetch },
                  }}
                >
                  <DeletePledgeModal
                    pledge={pledge}
                    handleClose={handleClose}
                  />
                </AppealsContext.Provider>
              </AppealsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </I18nextProvider>
);

describe('DeletePledgeModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
    refetch.mockClear();
  });
  it('default', async () => {
    const { getByRole } = render(<Components />);

    expect(
      getByRole('heading', { name: 'Remove Commitment' }),
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

  it('should remove commitment', async () => {
    const { getByRole } = render(<Components />);

    expect(mutationSpy).toHaveBeenCalledTimes(0);

    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully removed commitment from appeal',
        {
          variant: 'success',
        },
      );
    });

    await waitFor(() => {
      expect(mutationSpy.mock.calls[3][0].operation.operationName).toEqual(
        'DeleteAccountListPledge',
      );
      expect(mutationSpy.mock.calls[3][0].operation.variables).toEqual({
        input: {
          id: pledge.id,
        },
      });

      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });
});
