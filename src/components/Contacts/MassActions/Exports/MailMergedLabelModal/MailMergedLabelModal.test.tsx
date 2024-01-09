import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { exportRest } from '../exportRest';
import { MailMergedLabelModal } from './MailMergedLabelModal';

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

const mutationSpy = jest.fn();
const Components = () => (
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
  </ThemeProvider>
);

describe('MailMergedLabelModal', () => {
  beforeEach(() => {
    mutationSpy.mockReset();
    exportRest as jest.Mock;
    handleClose.mockClear();
  });
  it('Clicks on export action', async () => {
    const { queryByTestId, queryByText } = render(<Components />);
    await waitFor(() =>
      expect(queryByTestId('MailMergedLabel')).toBeInTheDocument(),
    );
    await waitFor(() => expect(exportRest).not.toHaveBeenCalled());
    userEvent.click(queryByText('Export') as HTMLInputElement);
    await waitFor(() => expect(exportRest).toHaveBeenCalled());
    await waitFor(() => {
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });
});

describe('MailMergedLabelModal when exportRest errors', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const exportRest = require('../exportRest');
  beforeEach(() => {
    handleClose.mockClear();
  });

  it('Stringifies JSON Error', async () => {
    exportRest.exportRest.mockImplementation(() =>
      Promise.reject('Error happened'),
    );
    const { queryByTestId, queryByText } = render(<Components />);
    await waitFor(() =>
      expect(queryByTestId('MailMergedLabel')).toBeInTheDocument(),
    );
    expect(mockEnqueue).not.toHaveBeenCalledWith();
    userEvent.click(queryByText('Export') as HTMLInputElement);
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('"Error happened"', {
        variant: 'error',
      }),
    );
  });

  it('Returns Error message', async () => {
    exportRest.exportRest.mockImplementation(() =>
      Promise.reject(new Error('Authenication missing')),
    );
    const { queryByTestId, queryByText } = render(<Components />);
    await waitFor(() =>
      expect(queryByTestId('MailMergedLabel')).toBeInTheDocument(),
    );
    expect(mockEnqueue).not.toHaveBeenCalledWith();
    userEvent.click(queryByText('Export') as HTMLInputElement);
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Authenication missing', {
        variant: 'error',
      }),
    );
  });
});
