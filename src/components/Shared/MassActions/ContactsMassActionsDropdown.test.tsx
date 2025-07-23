import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { AppSettingsProvider } from 'src/components/common/AppSettings/AppSettingsProvider';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import useTaskModal from '../../../hooks/useTaskModal';
import { PageEnum, TableViewModeEnum } from '../Header/ListHeader';
import { ContactsMassActionsDropdown } from './ContactsMassActionsDropdown';

const selectedIds: string[] = ['abc'];
const massDeselectAll = jest.fn();
const mockEnqueue = jest.fn();
const openTaskModal = jest.fn();

jest.mock('../../../hooks/useTaskModal');
jest.mock('src/hooks/useAccountListId');
jest.mock('next-auth/react');
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
  <TestRouter>
    <AppSettingsProvider>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <ContactsWrapper>
                <ContactsMassActionsDropdown
                  filterPanelOpen={false}
                  contactsView={TableViewModeEnum.List}
                  selectedIds={selectedIds}
                  page={PageEnum.Contact}
                />
              </ContactsWrapper>
            </SnackbarProvider>
          </LocalizationProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </AppSettingsProvider>
  </TestRouter>
);

describe('ContactsMassActionsDropdown', () => {
  beforeEach(() => {
    (useTaskModal as jest.Mock).mockReturnValue({
      openTaskModal,
      preloadTaskModal: jest.fn(),
    });
    (useAccountListId as jest.Mock).mockReturnValue('123456789');

    massDeselectAll.mockClear();
  });
  it('opens the more actions menu and clicks the add tags action', async () => {
    const { queryByText, getByTestId, findByText } = render(
      <ContactComponents />,
    );
    expect(queryByText('Add Tags')).not.toBeInTheDocument();
    const actionsButton = queryByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    const button = queryByText('Add Tags') as HTMLInputElement;
    await waitFor(() => expect(button).toBeInTheDocument());
    userEvent.click(button);
    const text = 'Create New Tags (separate multiple tags with Enter key) *';
    expect(await findByText(text)).toBeInTheDocument();
    userEvent.click(getByTestId('CloseIcon') as HTMLInputElement);
    await waitFor(() => expect(queryByText(text)).not.toBeInTheDocument());
  });

  it('opens the more actions menu and clicks the edit fields action', async () => {
    const { getByRole, queryByTestId, findByTestId, queryByText } = render(
      <ContactComponents />,
    );
    expect(queryByText('Edit Fields')).not.toBeInTheDocument();
    const actionsButton = queryByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    const button = queryByText('Edit Fields') as HTMLInputElement;
    await waitFor(() => expect(button).toBeInTheDocument());
    userEvent.click(button);
    const modalTestId = 'EditFieldsModal';
    expect(await findByTestId(modalTestId)).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(queryByTestId(modalTestId)).not.toBeInTheDocument(),
    );
  });

  it('opens the more actions menu and clicks the add to appeal action', async () => {
    const { getAllByTestId, queryByTestId, findByTestId, queryByText } = render(
      <ContactComponents />,
    );
    expect(queryByText('Add to Appeal')).not.toBeInTheDocument();
    userEvent.click(queryByText('Actions') as HTMLInputElement);
    const button = queryByText('Add to Appeal') as HTMLInputElement;
    await waitFor(() => expect(button).toBeInTheDocument());
    userEvent.click(button);
    expect(await findByTestId('AddToAppealModal')).toBeInTheDocument();

    userEvent.click(getAllByTestId('CloseIcon')[0] as HTMLInputElement);
    await waitFor(() =>
      expect(queryByTestId('AddToAppealModal')).not.toBeInTheDocument(),
    );
  });

  it('opens the more actions menu and clicks the add to new appeal action', async () => {
    const { queryByTestId, queryByText, findByTestId, getByRole } = render(
      <ContactComponents />,
    );
    expect(queryByText('Add to New Appeal')).not.toBeInTheDocument();
    userEvent.click(queryByText('Actions') as HTMLInputElement);
    const button = queryByText('Add to New Appeal') as HTMLInputElement;
    await waitFor(() => expect(button).toBeInTheDocument());
    userEvent.click(button);
    expect(await findByTestId('CreateAppealModal')).toBeInTheDocument();
    // Create Appeal
    userEvent.type(getByRole('textbox', { name: /appeal/i }), 'NewAppeal');
    await waitFor(() => expect(queryByText('Save')).not.toBeDisabled());
    userEvent.click(queryByText('Save') as HTMLInputElement);
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Appeal created!', {
        variant: 'success',
      }),
    );
    await waitFor(() =>
      expect(queryByTestId('CreateAppealModal')).not.toBeInTheDocument(),
    );
  });

  it('opens the more actions menu and clicks the hide contacts action', async () => {
    const { getByText, queryByText } = render(<ContactComponents />);

    expect(queryByText('Hide Contacts')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    expect(getByText('Hide Contacts')).toBeInTheDocument();
    userEvent.click(getByText('Hide Contacts'));
    await waitFor(() =>
      expect(
        getByText(
          'Are you sure you wish to hide the selected contact? Hiding a contact in MPDX actually sets the contact status to "Never Ask".',
        ),
      ).toBeInTheDocument(),
    );
    userEvent.click(getByText('Yes'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Contact(s) hidden successfully',
        { variant: 'success' },
      ),
    );
    await waitFor(() =>
      expect(
        queryByText(
          'Are you sure you wish to hide the selected contact? Hiding a contact in MPDX actually sets the contact status to "Never Ask".',
        ),
      ).not.toBeInTheDocument(),
    );
  });

  it('opens the more actions menu and clicks the remove tags action', async () => {
    const { getByTestId, queryByTestId, getByText, queryByText } = render(
      <ContactComponents />,
    );

    expect(queryByText('Remove Tags')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    await waitFor(() => expect(getByText('Remove Tags')).toBeInTheDocument());
    userEvent.click(getByText('Remove Tags'));
    await waitFor(() =>
      expect(getByTestId('RemoveTagsModal')).toBeInTheDocument(),
    );
    userEvent.click(getByTestId('CloseIcon') as HTMLInputElement);
    await waitFor(() =>
      expect(queryByTestId('RemoveTagsModal')).not.toBeInTheDocument(),
    );
  });

  it('opens the more actions menu and clicks the add task action', () => {
    const { getByText, queryByText } = render(<ContactComponents />);

    expect(queryByText('Add Task')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    expect(getByText('Add Task')).toBeInTheDocument();
    userEvent.click(getByText('Add Task'));
    expect(openTaskModal).toHaveBeenCalledWith({
      view: TaskModalEnum.Add,
      defaultValues: { contactIds: selectedIds },
    });
  });

  it('opens the more actions menu and clicks the log task action', () => {
    const { getByText, queryByText } = render(<ContactComponents />);

    expect(queryByText('Log Task')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    expect(getByText('Log Task')).toBeInTheDocument();
    userEvent.click(getByText('Log Task'));
    expect(openTaskModal).toHaveBeenCalledWith({
      view: TaskModalEnum.Log,
      defaultValues: { contactIds: selectedIds },
    });
  });

  it('opens export contacts modal, then open Mail Merged Label modal', async () => {
    const { getByText, queryByText, getByTestId, queryByTestId, findByText } =
      render(<ContactComponents />);

    expect(queryByText('Export')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    expect(getByText('Export')).toBeInTheDocument();
    userEvent.click(getByText('Export'));
    userEvent.click(await findByText('PDF of Mail Merged Labels'));
    await waitFor(() =>
      expect(getByTestId('MailMergedLabel')).toBeInTheDocument(),
    );
    userEvent.click(getByTestId('CloseIcon') as HTMLInputElement);
    await waitFor(() =>
      expect(queryByTestId('MailMergedLabel')).not.toBeInTheDocument(),
    );
  });

  it('opens the more actions menu and clicks the export emails action', async () => {
    const { queryByTestId, getByText, queryByText } = render(
      <ContactComponents />,
    );
    expect(queryByText('Export Emails')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    expect(getByText('Export Emails')).toBeInTheDocument();
    userEvent.click(getByText('Export Emails'));
    await waitFor(() =>
      expect(queryByTestId('ExportEmailsModal')).toBeInTheDocument(),
    );
    userEvent.click(queryByTestId('CloseIcon') as HTMLInputElement);
    await waitFor(() =>
      expect(queryByTestId('ExportEmailsModal')).not.toBeInTheDocument(),
    );
  });

  it('opens merge contacts modal with multiple id selected', async () => {
    const selectedIdsMerge = ['abc', 'def'];
    const { getByTestId, getByText, findByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
              <SnackbarProvider>
                <ContactsWrapper>
                  <ContactsMassActionsDropdown
                    filterPanelOpen={false}
                    contactsView={TableViewModeEnum.List}
                    selectedIds={selectedIdsMerge}
                    page={PageEnum.Contact}
                  />
                </ContactsWrapper>
              </SnackbarProvider>
            </LocalizationProvider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    expect(queryByText('Merge')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    userEvent.click(getByText('Merge'));
    expect(await findByTestId('MergeModal')).toBeInTheDocument();
    userEvent.click(getByTestId('CloseIcon') as HTMLInputElement);
  });

  it('does not open merge contacts modal when only one contact is selected', () => {
    const { queryByText, queryByTestId, getByText } = render(
      <ContactComponents />,
    );
    expect(queryByText('Merge')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    expect(getByText('Merge')).toBeInTheDocument();
    userEvent.click(getByText('Merge'));
    expect(mockEnqueue).toHaveBeenCalledWith(
      'You must select at least 2 contacts to merge.',
      { variant: 'error' },
    );
    expect(queryByTestId('MergeModal')).not.toBeInTheDocument();
  });

  it('should not be able to view add excluded contacts when page is not appeal', async () => {
    const { getByText, queryByText } = render(<ContactComponents />);

    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);

    expect(
      queryByText('Add Excluded Contacts To Appeal'),
    ).not.toBeInTheDocument();
    expect(getByText('Add to Appeal')).toBeInTheDocument();
    expect(getByText('Add to New Appeal')).toBeInTheDocument();
  });

  it('opens add excluded contacts modal when page is appeal', async () => {
    const selectedIdsMerge = ['abc', 'def'];
    const { getByTestId, getByText, findByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
              <SnackbarProvider>
                <AppealsWrapper>
                  <ContactsMassActionsDropdown
                    filterPanelOpen={false}
                    contactsView={TableViewModeEnum.List}
                    selectedIds={selectedIdsMerge}
                    page={PageEnum.Appeal}
                    isExcludedAppealPage={true}
                  />
                </AppealsWrapper>
              </SnackbarProvider>
            </LocalizationProvider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    const actionsButton = getByText('Actions');
    userEvent.click(actionsButton);
    expect(queryByText('Add to Appeal')).not.toBeInTheDocument();
    expect(queryByText('Add to New Appeal')).not.toBeInTheDocument();
    expect(getByText('Add Excluded Contacts To Appeal')).toBeInTheDocument();
    userEvent.click(getByText('Add Excluded Contacts To Appeal'));
    expect(await findByText('Add Contacts')).toBeInTheDocument();
    userEvent.click(getByTestId('CloseIcon'));
  });
});
