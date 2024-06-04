import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ResetToDefaultModal } from './ResetToDefaultModal';

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

const resetColumnsMessage = 'reset columns message';
const handleClose = jest.fn();
const updateOptions = jest.fn();

describe('ResetToDefaultModal', () => {
  it('selects US default as the initial value', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ResetToDefaultModal
              resetColumnsMessage={resetColumnsMessage}
              updateOptions={updateOptions}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Reset columns to US (MPD) defaults')).toBeInTheDocument();
  });

  it('selects Global default', () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ResetToDefaultModal
              resetColumnsMessage={resetColumnsMessage}
              updateOptions={updateOptions}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.click(getByRole('combobox'));

    userEvent.click(
      getByRole('option', {
        name: 'Reset columns to Global (D MPD) defaults',
      }),
    );
    screen.logTestingPlaygroundURL();

    expect(
      getByText(
        'Resetting to default will change the columns back to the five phases of MPD. Are you sure you want to revert to the default columns?',
      ),
    ).toBeInTheDocument();
  });

  it('closes the modal', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ResetToDefaultModal
              resetColumnsMessage={resetColumnsMessage}
              updateOptions={updateOptions}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(handleClose).toHaveBeenCalled();
  });

  it('handles the submit', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ResetToDefaultModal
              resetColumnsMessage={resetColumnsMessage}
              updateOptions={updateOptions}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.click(getByRole('button', { name: 'Confirm' }));
    screen.logTestingPlaygroundURL();

    await waitFor(() => {
      expect(updateOptions).toHaveBeenCalled();
      expect(mockEnqueue).toHaveBeenCalledWith(resetColumnsMessage, {
        variant: 'success',
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
