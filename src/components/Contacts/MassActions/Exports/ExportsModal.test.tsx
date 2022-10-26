import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { SessionProvider } from 'next-auth/react';
import userEvent from '@testing-library/user-event';
import { ExportsModal } from './ExportsModal';
import theme from 'src/theme';

const ids = ['abc'];
const accountListId = '123';
const handleClose = jest.fn();
const openMailMergedLabelModal = jest.fn();

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

describe('ExportsModal', () => {
  it('default', () => {
    const { getByText } = render(
      <SessionProvider>
        <ThemeProvider theme={theme}>
          <ExportsModal
            ids={ids}
            accountListId={accountListId}
            handleClose={handleClose}
            openMailMergedLabelModal={openMailMergedLabelModal}
          />
        </ThemeProvider>
      </SessionProvider>,
    );

    expect(getByText('Export Contacts')).toBeInTheDocument();
    expect(getByText('PDF of Mail Merged Labels')).toBeInTheDocument();
    expect(getByText('CSV for Mail Merge')).toBeInTheDocument();
    expect(getByText('Advanced CSV')).toBeInTheDocument();
    expect(getByText('Advanced Excel (XLSX)')).toBeInTheDocument();
  });

  it('handle clicking the mail merged labels button', () => {
    const { getByText } = render(
      <SessionProvider>
        <ThemeProvider theme={theme}>
          <ExportsModal
            ids={ids}
            accountListId={accountListId}
            handleClose={handleClose}
            openMailMergedLabelModal={openMailMergedLabelModal}
          />
        </ThemeProvider>
      </SessionProvider>,
    );

    expect(getByText('Export Contacts')).toBeInTheDocument();
    userEvent.click(getByText('PDF of Mail Merged Labels'));
    expect(openMailMergedLabelModal).toHaveBeenCalled();
  });
});
