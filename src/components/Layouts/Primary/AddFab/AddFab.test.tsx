import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import {
  getDataForTaskDrawerMock,
  createTaskMutationMock,
} from '../../../Task/Drawer/Form/Form.mock';
import { useApp } from '../../../App';
import AddFab from '.';

jest.mock('../../../App', () => ({
  useApp: jest.fn(),
}));

const openTaskDrawer = jest.fn();

beforeEach(() => {
  (useApp as jest.Mock).mockReturnValue({
    openTaskDrawer,
  });
});

describe('AddFab', () => {
  it('default', async () => {
    const mocks = [getDataForTaskDrawerMock(), createTaskMutationMock()];
    const { getByRole } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <SnackbarProvider>
            <AddFab />
          </SnackbarProvider>
        </MuiPickersUtilsProvider>
      </MockedProvider>,
    );
    userEvent.click(getByRole('button', { name: 'Add' }));
    userEvent.click(getByRole('menuitem'));
    expect(openTaskDrawer).toHaveBeenCalledWith({});
  });
});
