import React from 'react';
import { SnackbarProvider } from 'notistack';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import theme from 'src/theme';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MassActionsAddToAppealModal } from './MassActionsAddToAppealModal';
import { GetAppealsForMassActionQuery } from './GetAppealsForMassAction.generated';

const selectedIds: string[] = ['abc'];
const accountListId = '123456789';
const handleClose = jest.fn();
const mockEnqueue = jest.fn();
const appealName = 'AppealNameForTest';
const mocks = {
  GetAppealsForMassAction: {
    appeals: {
      nodes: [
        {
          id: 'appealID',
          name: appealName,
          contactIds: ['contactIdOne', 'contactIdTwo'],
        },
      ],
      pageInfo: {
        hasNextPage: false,
      },
    },
  },
};

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

describe('MassActionsAddToAppealModal', () => {
  beforeEach(() => {
    handleClose.mockClear();
  });
  it('Type and submit new appeal, before clicking save action', async () => {
    const mutationSpy = jest.fn();
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetAppealsForMassAction: GetAppealsForMassActionQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <MassActionsAddToAppealModal
                ids={selectedIds}
                accountListId={accountListId}
                handleClose={handleClose}
              />
            </SnackbarProvider>
          </LocalizationProvider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('AddToAppealModal')).toBeInTheDocument(),
    );
    const appealInput = queryByTestId('appealTextInput') as HTMLInputElement;
    userEvent.click(appealInput);
    userEvent.type(appealInput, 'Appeal');
    await waitFor(() =>
      expect(queryByText(appealName) as HTMLInputElement).toBeInTheDocument(),
    );
    userEvent.click(queryByText(appealName) as HTMLInputElement);
    userEvent.click(queryByText('Save') as HTMLInputElement);
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contacts updated!', {
        variant: 'success',
      }),
    );
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        mutationSpy.mock.calls[1][0].operation.variables.attributes,
      ).toEqual({
        contactIds: ['abc', 'contactIdOne', 'contactIdTwo'],
        id: 'appealID',
      }),
    );
  });
});
