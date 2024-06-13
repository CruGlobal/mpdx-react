import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { cleanup, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactDetailProvider } from 'src/components/Contacts/ContactDetails/ContactDetailContext';
import theme from 'src/theme';
import TntConnect from './TntConnect';
import { uploadTnt, validateTnt } from './uploadTntConnect';

const mockEnqueue = jest.fn();
const accountListId = '123';
const file1 = new File(['contents1'], 'tnt1.xml', {
  type: 'text/xml',
});
const file2 = new File(['contents2'], 'tnt2.xml', {
  type: 'application/xml',
});

jest.mock('./uploadTntConnect');

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

describe('TntConnect Import', () => {
  const createObjectURL = jest
    .fn()
    .mockReturnValueOnce('blob:1')
    .mockReturnValueOnce('blob:2');
  const revokeObjectURL = jest.fn();
  beforeEach(() => {
    (uploadTnt as jest.Mock).mockResolvedValue(undefined);
    (validateTnt as jest.Mock).mockReturnValue({ success: true });
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;
  });

  it('should handle uploading a file', async () => {
    const {
      getByRole,
      queryByText,
      getByTestId,
      findByText,
      getByText,
      queryByTestId,
    } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <TntConnect accountListId={accountListId} />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    const importButton = getByRole('button', { name: 'Import' });
    const fileInput = getByTestId('TntUpload');

    expect(importButton).toBeDisabled();
    expect(queryByTestId('LinearProgress')).not.toBeInTheDocument();

    userEvent.upload(fileInput, file1);
    expect(revokeObjectURL).not.toHaveBeenCalledWith('blob:1');
    expect(getByText('tnt1.xml')).toBeInTheDocument();

    userEvent.upload(fileInput, file2);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:1');

    userEvent.click(importButton);
    expect(queryByTestId('LinearProgress')).toBeInTheDocument();
    expect(await findByText('Good Work!')).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Ok' }));
    await waitFor(() =>
      expect(queryByText('Good Work!')).not.toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(uploadTnt).toHaveBeenCalledWith(
        expect.objectContaining({
          accountListId,
          selectedTags: [],
          override: 'false',
          file: file2,
        }),
      ),
    );

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Upload Complete', {
        variant: 'success',
      }),
    );

    cleanup();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:2');
  });

  it('should save tags and radio buttons', async () => {
    const { getByRole, getByText, getByTestId } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <TntConnect accountListId={accountListId} />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    const input = getByRole('combobox') as HTMLInputElement;
    userEvent.type(input, 'tag123');
    expect(input.value).toBe('tag123');
    userEvent.type(input, '{enter}');

    userEvent.click(
      getByText(
        'This import should override all fields in current contacts (contact info, notes) and add new contacts.',
      ),
    );

    userEvent.upload(getByTestId('TntUpload'), file1);
    userEvent.click(getByRole('button', { name: 'Import' }));

    await waitFor(() =>
      expect(uploadTnt).toHaveBeenCalledWith(
        expect.objectContaining({
          accountListId,
          selectedTags: ['tag123'],
          override: 'true',
          file: file1,
        }),
      ),
    );
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Upload Complete', {
        variant: 'success',
      }),
    );
  });

  it('should notify the user about validation errors', () => {
    (validateTnt as jest.Mock).mockReturnValue({
      success: false,
      message: 'Invalid file',
    });

    const { getByTestId } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <TntConnect accountListId={accountListId} />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    userEvent.upload(getByTestId('TntUpload'), file1);

    expect(mockEnqueue).toHaveBeenCalledWith('Invalid file', {
      variant: 'error',
    });
  });

  it('should notify the user about upload errors', async () => {
    (uploadTnt as jest.Mock).mockRejectedValue(
      new Error('File could not be uploaded'),
    );

    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <TntConnect accountListId={accountListId} />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    userEvent.upload(getByTestId('TntUpload'), file1);
    userEvent.click(getByRole('button', { name: 'Import' }));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('File could not be uploaded', {
        variant: 'error',
      });
    });
  });
  it('should show default error message', async () => {
    (uploadTnt as jest.Mock).mockRejectedValue(500);

    const { getByTestId, getByRole } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <TntConnect accountListId={accountListId} />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    userEvent.upload(getByTestId('TntUpload'), file1);
    await waitFor(() => {
      userEvent.click(getByRole('button', { name: 'Import' }));
    });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('File could not be uploaded', {
        variant: 'error',
      });
    });
  });
});
