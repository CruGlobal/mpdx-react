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
import useTaskDrawer from '../../../../hooks/useTaskDrawer';
import AddFab from '.';

jest.mock('../../../../hooks/useTaskDrawer');

const openTaskDrawer = jest.fn();

beforeEach(() => {
  (useTaskDrawer as jest.Mock).mockReturnValue({
    openTaskDrawer,
  });
});

describe('AddFab', () => {
  it('default', async () => {
    const mocks = [getDataForTaskDrawerMock('abc'), createTaskMutationMock()];
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
