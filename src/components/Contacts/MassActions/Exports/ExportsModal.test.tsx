import React from 'react';
import { useSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { render } from '@testing-library/react';
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
    const { getByRole } = render(<ContactComponents />);

    expect(exportRest).not.toHaveBeenCalled();
    userEvent.click(getByRole('button', { name: 'CSV for Mail Merge' }));
    expect(exportRest).toHaveBeenCalled();

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
