import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../ContactPeople.generated';
import { gqlMock } from '../../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../../theme';
import { EditPersonModal } from './EditPersonModal';

const handleOpenModal = jest.fn();
const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc);

const mockPerson = mock.people.nodes[0];

describe('EditPersonModal', () => {
  it('should render edit person modal', () => {
    const { getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider theme={theme}>
          <EditPersonModal
            isOpen={true}
            handleOpenModal={handleOpenModal}
            person={mockPerson}
          />
        </ThemeProvider>
        ,
      </MuiPickersUtilsProvider>,
    );

    expect(getByText('Edit Person')).toBeInTheDocument();
  });

  it('should close edit contact modal', () => {
    const { getByRole, getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider theme={theme}>
          <EditPersonModal
            isOpen={true}
            handleOpenModal={handleOpenModal}
            person={mockPerson}
          />
        </ThemeProvider>
        ,
      </MuiPickersUtilsProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleOpenModal).toHaveBeenLastCalledWith(false);
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider theme={theme}>
          <EditPersonModal
            isOpen={true}
            handleOpenModal={handleOpenModal}
            person={mockPerson}
          />
        </ThemeProvider>
        ,
      </MuiPickersUtilsProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleOpenModal).toHaveBeenLastCalledWith(false);
  });

  it('should handle save click', () => {
    const { getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider theme={theme}>
          <EditPersonModal
            isOpen={true}
            handleOpenModal={handleOpenModal}
            person={mockPerson}
          />
        </ThemeProvider>
        ,
      </MuiPickersUtilsProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByText('Save'));
    expect(handleOpenModal).toHaveBeenLastCalledWith(false);
  });

  it('should handle Show More click', async () => {
    const { queryAllByText, getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider theme={theme}>
          <EditPersonModal
            isOpen={true}
            handleOpenModal={handleOpenModal}
            person={mockPerson}
          />
        </ThemeProvider>
        ,
      </MuiPickersUtilsProvider>,
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(queryAllByText('Show More')[0]);
    await waitFor(() => expect(getByText('Show Less')).toBeInTheDocument());
  });

  it('should handle Show Less click', async () => {
    const { queryAllByText, getByText, queryByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider theme={theme}>
          <EditPersonModal
            isOpen={true}
            handleOpenModal={handleOpenModal}
            person={mockPerson}
          />
        </ThemeProvider>
        ,
      </MuiPickersUtilsProvider>,
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
