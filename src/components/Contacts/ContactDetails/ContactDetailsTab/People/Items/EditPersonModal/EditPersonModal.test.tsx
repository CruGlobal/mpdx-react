import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../ContactPeople.generated';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../../theme';
import { EditPersonModal } from './EditPersonModal';
import { UpdatePersonMutation } from './EditPersonModal.generated';

const handleClose = jest.fn();
const accountListId = '123';
const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc);

const mockPerson = mock.people.nodes[0];

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

describe('EditPersonModal', () => {
  it('should render edit person modal', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdatePersonMutation>>
              <EditPersonModal
                accountListId={accountListId}
                handleClose={handleClose}
                person={mockPerson}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Person')).toBeInTheDocument();
  });

  it('should close edit contact modal', () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdatePersonMutation>>
              <EditPersonModal
                accountListId={accountListId}
                handleClose={handleClose}
                person={mockPerson}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdatePersonMutation>>
              <EditPersonModal
                accountListId={accountListId}
                handleClose={handleClose}
                person={mockPerson}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle save click', async () => {
    const mutationSpy = jest.fn();
    const { getByText } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdatePersonMutation> onCall={mutationSpy}>
              <EditPersonModal
                accountListId={accountListId}
                handleClose={handleClose}
                person={mockPerson}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(handleClose).toHaveBeenCalled());
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
      variant: 'success',
    });
  });

  it('should handle Show More click', async () => {
    const { queryAllByText, getByText } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdatePersonMutation>>
              <EditPersonModal
                accountListId={accountListId}
                handleClose={handleClose}
                person={mockPerson}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(queryAllByText('Show More')[0]);
    await waitFor(() => expect(getByText('Show Less')).toBeInTheDocument());
  });

  it('should handle Show Less click', async () => {
    const { queryAllByText, getByText, queryByText } = render(
      <SnackbarProvider>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdatePersonMutation>>
              <EditPersonModal
                accountListId={accountListId}
                handleClose={handleClose}
                person={mockPerson}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </MuiPickersUtilsProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(queryAllByText('Show More')[0]);
    await waitFor(() => expect(getByText('Show Less')).toBeInTheDocument());
    userEvent.click(queryAllByText('Show Less')[0]);
    await waitFor(() =>
      expect(queryByText('Show Less')).not.toBeInTheDocument(),
    );
  });
});
