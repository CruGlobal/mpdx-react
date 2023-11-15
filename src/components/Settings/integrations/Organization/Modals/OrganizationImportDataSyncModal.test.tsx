import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations/IntegrationsContext';
import TestRouter from '__tests__/util/TestRouter';
import theme from '../../../../../theme';
import { validateFile } from 'src/components/Shared/FileUploads/tntConnectDataSync';
import { OrganizationImportDataSyncModal } from './OrganizationImportDataSyncModal';

jest.mock('src/components/Shared/FileUploads/tntConnectDataSync');
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

const Components = (children: React.ReactElement) => (
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
const refetchOrganizations = jest.fn();

describe('OrganizationImportDataSyncModal', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';

  beforeEach(() => {
    handleClose.mockClear();
    refetchOrganizations.mockClear();
    (validateFile as jest.Mock).mockReturnValue({ success: true });
  });
  it('should render modal', async () => {
    const { getByText, getByTestId } = render(
      Components(
        <GqlMockedProvider>
          <OrganizationImportDataSyncModal
            handleClose={handleClose}
            organizationId={organizationId}
            organizationName={organizationName}
            accountListId={accountListId}
          />
        </GqlMockedProvider>,
      ),
    );

    expect(getByText('Import TntConnect DataSync file')).toBeInTheDocument();

    userEvent.click(getByText(/cancel/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
    userEvent.click(getByTestId('CloseIcon'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should return error when no file present', async () => {
    const mutationSpy = jest.fn();
    const { getByText } = render(
      Components(
        <GqlMockedProvider onCall={mutationSpy}>
          <OrganizationImportDataSyncModal
            handleClose={handleClose}
            organizationId={organizationId}
            organizationName={organizationName}
            accountListId={accountListId}
          />
        </GqlMockedProvider>,
      ),
    );
    userEvent.click(getByText('Upload File'));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Please select a file to upload.',
        {
          variant: 'error',
        },
      ),
    );
  });

  it('should inform user of the error when uploadiung file.', async () => {
    (validateFile as jest.Mock).mockReturnValue({
      success: false,
      message: 'Invalid file',
    });
    const mutationSpy = jest.fn();
    const { getByTestId, getByText } = render(
      Components(
        <GqlMockedProvider onCall={mutationSpy}>
          <OrganizationImportDataSyncModal
            handleClose={handleClose}
            organizationId={organizationId}
            organizationName={organizationName}
            accountListId={accountListId}
          />
        </GqlMockedProvider>,
      ),
    );

    const file = new File(['contents'], 'image.png', {
      type: 'image/png',
    });
    userEvent.upload(getByTestId('importFileUploader'), file);

    userEvent.click(getByText('Upload File'));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Invalid file', {
        variant: 'error',
      }),
    );
  });
  // TODO: Need more tests with uploading correct file.
  // Issue with node-fetch.
});
