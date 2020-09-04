import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import userEvent from '@testing-library/user-event';
import { getDataForTaskDrawerMock, createTaskMutationMock } from '../../../Task/Drawer/Form/Form.mock';
import { DrawerProviderContext } from '../../../Drawer/Provider';
import AddFab from '.';

const openTaskDrawer = jest.fn();

jest.mock('../../../Drawer', () => ({
    useDrawer: (): Partial<DrawerProviderContext> => ({
        openTaskDrawer,
    }),
}));

describe(AddFab.name, () => {
    beforeEach(() => {
        openTaskDrawer.mockClear();
    });

    it('default', async () => {
        const mocks = [getDataForTaskDrawerMock(), { ...createTaskMutationMock(), delay: 0 }];
        const { getByRole } = render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
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
