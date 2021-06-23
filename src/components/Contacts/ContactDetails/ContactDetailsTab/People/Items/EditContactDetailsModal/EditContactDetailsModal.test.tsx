import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../ContactPeople.generated';
import { ContactDetailsTabQuery } from '../../../ContactDetailsTab.generated';
import { gqlMock } from '../../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../../theme';
import { EditContactDetailsModal } from './EditContactDetailsModal';

const handleOpenModal = jest.fn();
const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc);
const contactId = '123';

const mockContact: ContactDetailsTabQuery['contact'] = {
  name: 'test person',
  id: contactId,
  tagList: [],
  people: mock.people,
  primaryPerson: mock.primaryPerson,
};

describe('EditContactDetailsModal', () => {
  it('should render edit contact details modal', () => {
    const { getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider theme={theme}>
          <EditContactDetailsModal
            isOpen={true}
            handleOpenModal={handleOpenModal}
            contact={mockContact}
          />
        </ThemeProvider>
        ,
      </MuiPickersUtilsProvider>,
    );

    expect(getByText('Edit Contact Details')).toBeInTheDocument();
  });

  it('should close edit contact modal', () => {
    const { getByRole, getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider theme={theme}>
          <EditContactDetailsModal
            isOpen={true}
            handleOpenModal={handleOpenModal}
            contact={mockContact}
          />
        </ThemeProvider>
        ,
      </MuiPickersUtilsProvider>,
    );
    expect(getByText('Edit Contact Details')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleOpenModal).toHaveBeenLastCalledWith(false);
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider theme={theme}>
          <EditContactDetailsModal
            isOpen={true}
            handleOpenModal={handleOpenModal}
            contact={mockContact}
          />
        </ThemeProvider>
        ,
      </MuiPickersUtilsProvider>,
    );
    expect(getByText('Edit Contact Details')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleOpenModal).toHaveBeenLastCalledWith(false);
  });

  it('should handle save click', () => {
    const { getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider theme={theme}>
          <EditContactDetailsModal
            isOpen={true}
            handleOpenModal={handleOpenModal}
            contact={mockContact}
          />
        </ThemeProvider>
        ,
      </MuiPickersUtilsProvider>,
    );
    expect(getByText('Edit Contact Details')).toBeInTheDocument();
    userEvent.click(getByText('Save'));
    expect(handleOpenModal).toHaveBeenLastCalledWith(false);
  });
});
