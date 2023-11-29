import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
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
    exportRest as jest.Mock;
    massDeselectAll.mockClear();
  });

  it('Clicks CSV export', async () => {
    const { getByRole } = render(<ContactComponents />);

    expect(exportRest).not.toHaveBeenCalled();
    userEvent.click(getByRole('button', { name: 'CSV for Mail Merge' }));
    expect(exportRest).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    expect(
      getByRole('button', { name: 'PDF of Mail Merged Labels' }),
    ).toBeDisabled();
    expect(getByRole('button', { name: 'CSV for Mail Merge' })).toBeDisabled();
    expect(getByRole('button', { name: 'Advanced CSV' })).toBeDisabled();
    expect(
      getByRole('button', { name: 'Advanced Excel (XLSX)' }),
    ).toBeDisabled();
  });

  it('Clicks Advanced CSV export', async () => {
    const { getByRole } = render(<ContactComponents />);

    expect(exportRest).not.toHaveBeenCalled();
    userEvent.click(getByRole('button', { name: 'Advanced CSV' }));
    expect(exportRest).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    expect(
      getByRole('button', { name: 'PDF of Mail Merged Labels' }),
    ).toBeDisabled();
    expect(getByRole('button', { name: 'CSV for Mail Merge' })).toBeDisabled();
    expect(getByRole('button', { name: 'Advanced CSV' })).toBeDisabled();
    expect(
      getByRole('button', { name: 'Advanced Excel (XLSX)' }),
    ).toBeDisabled();
  });

  it('Clicks Advanced Excel', async () => {
    const { getByRole } = render(<ContactComponents />);

    expect(exportRest).not.toHaveBeenCalled();
    userEvent.click(getByRole('button', { name: 'Advanced Excel (XLSX)' }));
    expect(exportRest).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    expect(
      getByRole('button', { name: 'PDF of Mail Merged Labels' }),
    ).toBeDisabled();
    expect(getByRole('button', { name: 'CSV for Mail Merge' })).toBeDisabled();
    expect(getByRole('button', { name: 'Advanced CSV' })).toBeDisabled();
    expect(
      getByRole('button', { name: 'Advanced Excel (XLSX)' }),
    ).toBeDisabled();
  });
});

describe('ExportsModals when exportRest errors', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const exportRest = require('./exportRest');
  beforeEach(() => {
    massDeselectAll.mockClear();
  });

  it('Stringifies JSON Error', async () => {
    exportRest.exportRest.mockImplementation(() =>
      Promise.reject('Error happened'),
    );
    const { getByRole } = render(<ContactComponents />);
    expect(mockEnqueue).not.toHaveBeenCalledWith();

    userEvent.click(getByRole('button', { name: 'CSV for Mail Merge' }));
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
    const { getByRole } = render(<ContactComponents />);
    expect(mockEnqueue).not.toHaveBeenCalledWith();

    userEvent.click(getByRole('button', { name: 'CSV for Mail Merge' }));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Authenication missing', {
        variant: 'error',
      }),
    );
  });
});
