import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { MassActionsRemoveTagsModal } from './MassActionsRemoveTagsModal';

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
const selectedIds: string[] = ['abc'];
const accountListId = '123456789';

describe('MassActionsRemoveTagsModal', () => {
  it('Clicks on tag to remove it, then saves action', async () => {
    const mutationSpy = jest.fn();
    const handleClose = jest.fn();
    const tagName = 'Circus';
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <MassActionsRemoveTagsModal
                accountListId={accountListId}
                ids={selectedIds}
                handleClose={handleClose}
              />
            </SnackbarProvider>
          </LocalizationProvider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(getByText('Select tags to remove:')).toBeInTheDocument(),
    );
    userEvent.click(getByText(tagName));
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Tags removed from contacts!', {
        variant: 'success',
      }),
    );
    const tags: string[] =
      mutationSpy.mock.calls[2][0].operation.variables.attributes.map(
        ({ tagList }) => tagList,
      );
    expect(tags.some((t) => t === tagName)).toEqual(false);
  });
});
