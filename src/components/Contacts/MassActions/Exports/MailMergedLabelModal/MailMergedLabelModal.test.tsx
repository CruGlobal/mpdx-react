import React from 'react';
import { useSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import theme from 'src/theme';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MailMergedLabelModal } from './MailMergedLabelModal';
import { exportRest } from '../exportRest';

jest.mock('next-auth/react');
jest.mock('../exportRest');

const mockEnqueue = jest.fn();
const selectedIds: string[] = ['abc', 'def'];
const accountListId = '123456789';
const handleClose = jest.fn();

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

describe('MailMergedLabelModal', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          apiToken: 'someToken1234',
        },
      },
      status: 'authenticated',
    });
    exportRest as jest.Mock;
    handleClose.mockClear();
  });
  it('Clicks on export action', async () => {
    const mutationSpy = jest.fn();
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <MailMergedLabelModal
                ids={selectedIds}
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </SnackbarProvider>
          </LocalizationProvider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('MailMergedLabel')).toBeInTheDocument(),
    );
    await waitFor(() => expect(exportRest).not.toHaveBeenCalled());
    userEvent.click(queryByText('Export') as HTMLInputElement);
    await waitFor(() => expect(exportRest).toHaveBeenCalled());
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });
});
