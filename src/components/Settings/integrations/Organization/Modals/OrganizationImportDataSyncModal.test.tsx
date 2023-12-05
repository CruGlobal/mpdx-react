import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations/IntegrationsContext';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import {
  OrganizationImportDataSyncModal,
  validateFile,
} from './OrganizationImportDataSyncModal';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const organizationId = 'organizationId';
const organizationName = 'organizationName';
const contactId = 'contact-1';
const apiToken = 'apiToken';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};

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

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <IntegrationsContextProvider apiToken={apiToken}>
          {children}
        </IntegrationsContextProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const handleClose = jest.fn();

const t = (text: string) => {
  return text;
};

describe('OrganizationImportDataSyncModal', () => {
  describe('ValidateFile()', () => {
    it('File type is not correct', () => {
      const file = new File(['contents'], 'image.png', {
        type: 'image/png',
      });
      const response = validateFile({ file, t });

      expect(response).toEqual({
        success: false,
        message:
          'Cannot upload file: file must be an .tntmpd or .tntdatasync file.',
      });
    });

    it('File size is too big', () => {
      const file = new File(['contents'], '.tntmpd', {
        type: 'xml',
      });
      Object.defineProperty(file, 'size', { value: 200_000_000 });
      const response = validateFile({ file, t });

      expect(response).toEqual({
        success: false,
        message: 'Cannot upload file: file size cannot exceed 100MB',
      });
    });

    it('File type is correct', () => {
      const file = new File(['contents'], '.tntmpd', {
        type: 'xml',
      });
      const response = validateFile({ file, t });

      expect(response).toEqual({
        success: true,
      });
    });
  });

  describe('Render and upload file tests', () => {
    process.env.OAUTH_URL = 'https://auth.mpdx.org';

    beforeEach(() => {
      handleClose.mockClear();
    });
    it('should render modal', async () => {
      const { getByText, getByTestId } = render(
        <Components>
          <GqlMockedProvider>
            <OrganizationImportDataSyncModal
              handleClose={handleClose}
              organizationId={organizationId}
              organizationName={organizationName}
              accountListId={accountListId}
            />
          </GqlMockedProvider>
        </Components>,
      );

      expect(getByText('Import TntConnect DataSync file')).toBeInTheDocument();

      userEvent.click(getByText(/cancel/i));
      expect(handleClose).toHaveBeenCalledTimes(1);
      userEvent.click(getByTestId('CloseIcon'));
      expect(handleClose).toHaveBeenCalledTimes(2);
    });

    describe('Send Files to API', () => {
      const fetch = jest.fn().mockResolvedValue({ status: 201 });
      beforeEach(() => {
        window.fetch = fetch;
      });

      it('should return error when file is too large', async () => {
        const mutationSpy = jest.fn();
        const { getByText, getByTestId } = render(
          <Components>
            <GqlMockedProvider onCall={mutationSpy}>
              <OrganizationImportDataSyncModal
                handleClose={handleClose}
                organizationId={organizationId}
                organizationName={organizationName}
                accountListId={accountListId}
              />
            </GqlMockedProvider>
          </Components>,
        );
        const file = new File(['contents'], '.tntmpd', {
          type: 'xml',
        });
        Object.defineProperty(file, 'size', {
          value: 200_000_000,
          configurable: true,
        });
        userEvent.upload(getByTestId('importFileUploader'), file);

        await waitFor(() =>
          expect(mockEnqueue).toHaveBeenCalledWith(
            'Cannot upload file: file size cannot exceed 100MB',
            {
              variant: 'error',
            },
          ),
        );
        expect(getByText('Upload File')).toBeDisabled();
      });

      it('should inform user of the error when uploading file.', async () => {
        const mutationSpy = jest.fn();
        const { getByTestId, getByText } = render(
          <Components>
            <GqlMockedProvider onCall={mutationSpy}>
              <OrganizationImportDataSyncModal
                handleClose={handleClose}
                organizationId={organizationId}
                organizationName={organizationName}
                accountListId={accountListId}
              />
            </GqlMockedProvider>
          </Components>,
        );

        const file = new File(['contents'], 'image.png', {
          type: 'image/png',
        });
        userEvent.upload(getByTestId('importFileUploader'), file);
        await waitFor(() =>
          expect(mockEnqueue).toHaveBeenCalledWith(
            'Cannot upload file: file must be an .tntmpd or .tntdatasync file.',
            {
              variant: 'error',
            },
          ),
        );
        expect(getByText('Upload File')).toBeDisabled();
      });

      it('should send formData and show successful banner', async () => {
        const mutationSpy = jest.fn();
        const { getByTestId, getByText } = render(
          <Components>
            <GqlMockedProvider onCall={mutationSpy}>
              <OrganizationImportDataSyncModal
                handleClose={handleClose}
                organizationId={organizationId}
                organizationName={organizationName}
                accountListId={accountListId}
              />
            </GqlMockedProvider>
          </Components>,
        );

        await waitFor(() => {
          expect(getByText('Upload File')).toBeDisabled();
        });

        const testValue = [{ isTest: 'It is a test' }];
        const str = JSON.stringify(testValue);
        const blob = new Blob([str]);
        const tntDataSync = new File([blob], '.tntmpd', {
          type: 'xml',
        });

        await act(() => {
          userEvent.upload(getByTestId('importFileUploader'), tntDataSync);
        });
        await waitFor(() => {
          expect(getByText('Upload File')).not.toBeDisabled();
        });
        userEvent.click(getByText('Upload File'));
        await waitFor(() => {
          expect(window.fetch).toHaveBeenCalledWith(
            '/api/uploads/tnt-data-sync',
            expect.objectContaining({
              method: 'POST',
              body: expect.any(FormData),
            }),
          );
        });

        const formData = Object.fromEntries(
          (window.fetch as jest.Mock<any, any>).mock.calls[0][1].body.entries(),
        );

        expect(formData).toEqual({
          accountListId,
          organizationId,
          tntDataSync,
        });
        await waitFor(() =>
          expect(mockEnqueue).toHaveBeenCalledWith(
            `File successfully uploaded. The import to ${organizationName} will begin in the background.`,
            {
              variant: 'success',
            },
          ),
        );
      });
    });
  });
});
