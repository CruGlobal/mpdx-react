import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { GetContactsForAddingTagsQuery } from './ContactsAddTags.generated';
import { MassActionsAddTagsModal } from './MassActionsAddTagsModal';

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

const selectedIds = ['abc'];
const accountListId = '123456789';
describe('MassActionsAddTags', () => {
  it('opens the more actions menu and clicks the add tags action', async () => {
    const mutationSpy = jest.fn();
    const handleClose = jest.fn();

    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <MassActionsAddTagsModal
                accountListId={accountListId}
                ids={selectedIds}
                handleClose={handleClose}
              />
            </SnackbarProvider>
          </LocalizationProvider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    const input = getByRole('combobox') as HTMLInputElement;
    userEvent.type(input, 'tag123');
    expect(input.value).toBe('tag123');
    userEvent.type(input, '{enter}');
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(handleClose).toHaveBeenCalled());

    const { operation } = mutationSpy.mock.calls[2][0];
    expect(operation.variables.attributes[0].tagList[0]).toEqual('tag123');
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Tags added to contacts!', {
        variant: 'success',
      }),
    );
  });
  it('should delete the duplicate tag', async () => {
    const mutationSpy = jest.fn();
    const handleClose = jest.fn();

    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetContactsForAddingTags: GetContactsForAddingTagsQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            GetContactsForAddingTags: {
              contacts: {
                nodes: [
                  {
                    id: 'abc',
                    tagList: ['tag123'],
                  },
                ],
              },
            },
          }}
        >
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <MassActionsAddTagsModal
                accountListId={accountListId}
                ids={selectedIds}
                handleClose={handleClose}
              />
            </SnackbarProvider>
          </LocalizationProvider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    const input = getByRole('combobox') as HTMLInputElement;
    userEvent.type(input, 'tag123');
    expect(input.value).toBe('tag123');
    userEvent.type(input, '{enter}');
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(handleClose).toHaveBeenCalled());

    // Simulate the mutation being called twice with the same tag
    const { operation } = mutationSpy.mock.calls[2][0];
    expect(operation.variables.attributes[0].tagList[0]).toEqual('tag123');
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'One or more selected contacts already has this tag',
        {
          variant: 'error',
        },
      ),
    );
  });
});
