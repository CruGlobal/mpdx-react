import React from 'react';
import { SnackbarProvider } from 'notistack';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import theme from 'src/theme';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MassActionsExportEmailsModal } from './MassActionsExportEmailsModal';
import { GetEmailsForExportingQuery } from './GetEmailsForExporting.generated';

const mockEnqueue = jest.fn();
const selectedIds: string[] = ['abc'];
const accountListId = '123456789';
const handleClose = jest.fn();
const mocks = {
  GetEmailsForExporting: {
    contacts: {
      nodes: [
        {
          people: {
            nodes: [
              {
                primaryEmailAddress: {
                  email: 'testEmailOne@cru.org',
                },
              },
            ],
          },
        },
        {
          people: {
            nodes: [
              {
                primaryEmailAddress: {
                  email: 'testEmailTwo@cru.org',
                },
              },
            ],
          },
        },
      ],
    },
  },
};

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

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

describe('MassActionsExportEmailsModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
    jest.spyOn(navigator.clipboard, 'writeText');
  });
  it('Exports emails to clipboard, then opens Microsoft section, and exports Microsoft emails to clipboard', async () => {
    const mutationSpy = jest.fn();
    const { queryByTestId, queryByText, queryAllByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetEmailsForExportingQuery>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <MassActionsExportEmailsModal
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
      expect(queryByTestId('ExportEmailsModal')).toBeInTheDocument(),
    );
    // Export emails
    userEvent.click(queryAllByText('Copy All')[0]);
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'testEmailOne@cru.org,testEmailTwo@cru.org',
      ),
    );
    // Export Outlook emails
    userEvent.click(
      queryByText('Microsoft Outlook Format') as HTMLInputElement,
    );
    await waitFor(() =>
      expect(
        queryByText(
          'Microsoft Outlook requires emails to be separated by semicolons instead of commas.',
        ),
      ).toBeInTheDocument(),
    );

    userEvent.click(queryAllByText('Copy All')[1]);
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'testEmailOne@cru.org;testEmailTwo@cru.org',
      ),
    );
    // Exit
    userEvent.click(getByTestId('CloseIcon') as HTMLInputElement);
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });
});
