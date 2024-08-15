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
import { AppealQuery } from '../AddContactToAppealModal/appealInfo.generated';
import { AddExcludedContactModal } from './AddExcludedContactModal';

const accountListId = 'abc';
const appealId = 'appealId';
const contactId = 'contact-3';
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

const appealMock: AppealQuery = {
  appeal: {
    id: appealId,
    contactIds: ['contact-1', 'contact-2'],
  },
};

const Components = () => (
  <I18nextProvider i18n={i18n}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              Appeal: AppealQuery;
            }>
              mocks={{
                Appeal: appealMock,
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
                  }}
                >
                  <AddExcludedContactModal
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
  </I18nextProvider>
);

describe('AddExcludedContactModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
    refetch.mockClear();
  });
  it('default', () => {
    const { getByRole } = render(<Components />);

    expect(getByRole('heading', { name: 'Add Contact' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'No' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Yes' })).toBeInTheDocument();
  });

  it('should close modal', async () => {
    const { getByRole } = render(<Components />);

    expect(handleClose).toHaveBeenCalledTimes(0);
    await waitFor(() =>
      expect(getByRole('button', { name: 'No' })).not.toBeDisabled(),
    );
    userEvent.click(getByRole('button', { name: 'No' }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should send mutation and remove the contact from the excluded list', async () => {
    const { getByRole } = render(<Components />);

    expect(mutationSpy).toHaveBeenCalledTimes(0);
    expect(refetch).not.toHaveBeenCalled();

    await waitFor(() =>
      expect(getByRole('button', { name: 'Yes' })).not.toBeDisabled(),
    );
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(mutationSpy.mock.calls[4][0].operation.operationName).toEqual(
        'AssignContactsToAppeal',
      );
      expect(mutationSpy.mock.calls[4][0].operation.variables).toEqual({
        input: {
          accountListId,
          attributes: {
            id: appealId,
            contactIds: ['contact-1', 'contact-2', contactId],
          },
        },
      });

      expect(refetch).toHaveBeenCalledTimes(1);

      // TODO: When API is fixed, uncomment this
      // expect(mockEnqueue).toHaveBeenCalledWith(
      //   'Successfully added contact to appeal',
      //   {
      //     variant: 'success',
      //   },
      // );
    });
  });
});
