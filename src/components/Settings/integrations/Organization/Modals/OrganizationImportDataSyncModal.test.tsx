import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import {
  OrganizationImportDataSyncModal,
  validateFile,
} from './OrganizationImportDataSyncModal';

jest.mock('next-auth/react');

process.env.REST_API_URL = 'https://api.stage.mpdx.org/api/v2/';
const accountListId = 'account-list-1';
const organizationId = 'organizationId';
const organizationName = 'organizationName';
const contactId = 'contact-1';
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
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
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

      it('should inform user of the error when uploaded incorrect file type.', async () => {
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

        const str = JSON.stringify([{ isTest: 'It is a test' }]);
        const blob = new Blob([str]);
        const tntDataSync = new File([blob], '.tntmpd', {
          type: 'xml',
        });

        act(() => {
          userEvent.upload(getByTestId('importFileUploader'), tntDataSync);
        });
        await waitFor(() => {
          expect(getByText('Upload File')).not.toBeDisabled();
        });
        userEvent.click(getByText('Upload File'));
        await waitFor(() => {
          expect(window.fetch).toHaveBeenCalledWith(
            `${process.env.REST_API_URL}account_lists/${accountListId}/imports/tnt_data_sync`,
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
          'data[attributes][file]': tntDataSync,
          'data[relationships][source_account][data][id]': organizationId,
          'data[relationships][source_account][data][type]':
            'organization_accounts',
          'data[type]': 'imports',
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

    describe('handleSubmit error when sending files to API', () => {
      const fetch = jest.fn().mockResolvedValue({ status: 500 });
      beforeEach(() => {
        window.fetch = fetch;
      });

      it('should show an error when error occurs during upload', async () => {
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

        const str = JSON.stringify([{ isTest: 'It is a test' }]);
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

        await waitFor(() =>
          expect(mockEnqueue).toHaveBeenCalledWith(
            'Cannot upload file: server error',
            {
              variant: 'error',
            },
          ),
        );
      });
    });
  });
});
