import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { DeleteFilterModal } from './DeleteFilterModal';
//#region Mocks
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

const handleClose = jest.fn();

const savedFilter = {
  id: '7215b6a3-9085-4eb5-810d-01cdb6ccd997',
  key: 'graphql_saved_contacts_filter_GraphQL_Contact_Filter',
  value:
    '{"status":["ASK_IN_FUTURE","CONTACT_FOR_APPOINTMENT"],"accountListId":"08bb09d1-3b62-4690-9596-b625b8af4750"}',
};

describe('DeleteFilterModal', () => {
  it('renders modal', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <DeleteFilterModal
            isOpen={true}
            handleClose={handleClose}
            filter={savedFilter}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByText('Delete Saved filter')).toBeVisible();
  });

  it('closes modal', () => {
    const { getByText, getByLabelText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <DeleteFilterModal
            isOpen={true}
            handleClose={handleClose}
            filter={savedFilter}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByText('Delete Saved filter')).toBeVisible();
    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('closes modal when clicked on NO', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <DeleteFilterModal
            isOpen={true}
            handleClose={handleClose}
            filter={savedFilter}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByText('Delete Saved filter')).toBeVisible();
    userEvent.click(getByText('No'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('deletes the filter', async () => {
    const mutationSpy = jest.fn();
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <DeleteFilterModal
            isOpen={true}
            handleClose={handleClose}
            filter={savedFilter}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByText('Yes'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Saved Filter Deleted!', {
        variant: 'success',
      }),
    );

    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.input.id).toEqual(savedFilter.id);
    expect(handleClose).toHaveBeenCalled();
  });
});
