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
import { ExportsModal } from './ExportsModal';
import { exportRest } from './exportRest';

jest.mock('next-auth/react');
jest.mock('./exportRest');

const mockEnqueue = jest.fn();
const handleClose = jest.fn();
const openMailMergedLabelModal = jest.fn();
const massDeselectAll = jest.fn();
const selectedIds: string[] = ['abc'];
const accountListId = '123456789';

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

const ContactComponents = () => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <ExportsModal
            ids={selectedIds}
            accountListId={accountListId}
            handleClose={handleClose}
            openMailMergedLabelModal={openMailMergedLabelModal}
          />
        </SnackbarProvider>
      </LocalizationProvider>
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('ExportsModals', () => {
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
    massDeselectAll.mockClear();
  });
  it('Clicks CSV export', async () => {
    const { getByText } = render(<ContactComponents />);
    const exportType = getByText('CSV for Mail Merge') as HTMLInputElement;
    await waitFor(() => expect(exportType).toBeInTheDocument());
    userEvent.click(exportType);
    await waitFor(() => expect(exportRest).toHaveBeenCalled());
  });
  it('Clicks Advanced CSV export', async () => {
    await waitFor(() => expect(exportRest).not.toHaveBeenCalled());
    const { getByText } = render(<ContactComponents />);
    const exportType = getByText('Advanced CSV') as HTMLInputElement;
    await waitFor(() => expect(exportType).toBeInTheDocument());
    userEvent.click(exportType);
    await waitFor(() => expect(exportRest).toHaveBeenCalled());
  });
  it('Clicks Advanced Excel', async () => {
    await waitFor(() => expect(exportRest).not.toHaveBeenCalled());
    const { getByText } = render(<ContactComponents />);
    const exportType = getByText('Advanced Excel (XLSX)') as HTMLInputElement;
    await waitFor(() => expect(exportType).toBeInTheDocument());
    userEvent.click(exportType);
    await waitFor(() => expect(exportRest).toHaveBeenCalled());
  });
});
