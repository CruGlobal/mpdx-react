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
const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc, {
  mocks: {
    people: {
      nodes: [
        {
          emailAddresses: {
            nodes: [
              {
                email: 'test1234@test.com',
                primary: true,
                location: 'Work',
              },
              {
                email: 'secondemail@test.com',
                location: 'Mobile',
                primary: false,
              },
            ],
          },
          phoneNumbers: {
            nodes: [
              {
                number: '777-777-7777',
                location: 'Mobile',
                primary: true,
              },
              {
                number: '999-999-9999',
                location: 'Work',
                primary: false,
              },
            ],
          },
          facebookAccounts: {
            nodes: [
              {
                username: 'test guy',
              },
              {
                username: 'test guy 2',
              },
            ],
          },
          twitterAccounts: {
            nodes: [
              {
                screenName: '@testguy',
              },
              {
                screenName: '@testguy2',
              },
            ],
          },
          linkedinAccounts: {
            nodes: [
              {
                publicUrl: 'Test Guy',
              },
              {
                publicUrl: 'Test Guy 2',
              },
            ],
          },
          websites: {
            nodes: [
              {
                url: 'testguy.com',
              },
              {
                url: 'testguy2.com',
              },
            ],
          },
          optoutEnewsletter: false,
          anniversaryDay: 1,
          anniversaryMonth: 1,
          anniversaryYear: 1990,
          birthdayDay: 1,
          birthdayMonth: 1,
          birthdayYear: 1990,
          maritalStatus: 'Engaged',
          gender: 'Male',
          deceased: true,
        },
      ],
    },
  },
});

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
    userEvent.click(getByRole('button', { hidden: true, name: 'Close' }));
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

  it('should handle editing person name section', async () => {
    const mutationSpy = jest.fn();
    const newPersonFirstName = 'Test';
    const newPersonLastName = 'Guy';
    const newPersonTitle = 'Mr.';
    const newPersonSuffix = 'VI';

    const { getByText, getByRole } = render(
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

    userEvent.clear(getByRole('textbox', { hidden: true, name: 'First Name' }));
    userEvent.clear(getByRole('textbox', { hidden: true, name: 'Last Name' }));
    userEvent.clear(getByRole('textbox', { hidden: true, name: 'Title' }));
    userEvent.clear(getByRole('textbox', { hidden: true, name: 'Suffix' }));

    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'First Name' }),
      newPersonFirstName,
    );
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Last Name' }),
      newPersonLastName,
    );
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Title' }),
      newPersonTitle,
    );
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Suffix' }),
      newPersonSuffix,
    );

    userEvent.click(getByText('Save'));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.firstName).toEqual(
      newPersonFirstName,
    );
    expect(operation.variables.attributes.lastName).toEqual(newPersonLastName);
    expect(operation.variables.attributes.title).toEqual(newPersonTitle);
    expect(operation.variables.attributes.suffix).toEqual(newPersonSuffix);
  });

  it('should handle editing person phone number section', async () => {
    const mutationSpy = jest.fn();
    const newPersonPhoneNumber = '888-888-8888';
    const { getByText, getByRole, getAllByRole } = render(
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
    userEvent.clear(
      getAllByRole('textbox', { hidden: true, name: 'Phone Number' })[0],
    );
    userEvent.type(
      getAllByRole('textbox', { hidden: true, name: 'Phone Number' })[0],
      newPersonPhoneNumber,
    );
    userEvent.click(
      getAllByRole('button', { hidden: true, name: 'Phone Number Type' })[0],
    );
    userEvent.click(getByRole('option', { hidden: true, name: 'Work' }));
    userEvent.click(
      getByRole('button', { hidden: true, name: 'Primary Phone' }),
    );
    userEvent.click(
      getByRole('option', {
        hidden: true,
        name: mockPerson.phoneNumbers.nodes[1].number,
      }),
    );
    userEvent.click(getByText('Save'));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);

    expect(operation.variables.attributes.phoneNumbers[0].number).toEqual(
      newPersonPhoneNumber,
    );
    expect(operation.variables.attributes.phoneNumbers[0].primary).toEqual(
      false,
    );
    expect(operation.variables.attributes.phoneNumbers[1].primary).toEqual(
      true,
    );
    expect(operation.variables.attributes.phoneNumbers[0].location).toEqual(
      'Work',
    );
  });

  it('handles deleting a phone number', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getAllByRole } = render(
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
    userEvent.click(
      getAllByRole('img', {
        hidden: true,
        name: 'Modal Section Delete Icon',
      })[2],
    );
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);

    expect(operation.variables.attributes.phoneNumbers[1].destroy).toEqual(
      true,
    );
  });

  it('should handle editing person email section', async () => {
    const mutationSpy = jest.fn();
    const newPersonEmailAddress = 'testguy@fake.com';
    const { getByText, getByRole, getAllByRole } = render(
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
    userEvent.clear(
      getAllByRole('textbox', { hidden: true, name: 'Email Address' })[0],
    );
    expect(getByText('Edit Person')).toBeInTheDocument();

    userEvent.type(
      getAllByRole('textbox', { hidden: true, name: 'Email Address' })[0],
      newPersonEmailAddress,
    );
    userEvent.click(
      getAllByRole('button', { hidden: true, name: 'Email Address Type' })[0],
    );
    userEvent.click(getByRole('option', { hidden: true, name: 'Mobile' }));
    userEvent.click(
      getByRole('button', { hidden: true, name: 'Primary Email' }),
    );
    userEvent.click(
      getByRole('option', {
        hidden: true,
        name: mockPerson.emailAddresses.nodes[1].email,
      }),
    );
    userEvent.click(
      getByRole('checkbox', {
        hidden: true,
        name: 'Opt-out of Email Newsletter',
      }),
    );

    userEvent.click(getByText('Save'));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      }),
    );

    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.emailAddresses[0].email).toEqual(
      newPersonEmailAddress,
    );
    expect(operation.variables.attributes.emailAddresses[0].location).toEqual(
      'Mobile',
    );
    expect(operation.variables.attributes.emailAddresses[0].primary).toEqual(
      false,
    );
    expect(operation.variables.attributes.emailAddresses[1].primary).toEqual(
      true,
    );
    expect(operation.variables.attributes.optoutEnewsletter).toEqual(true);
  });

  it('handles deleting an email address', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getAllByRole } = render(
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
    userEvent.click(
      getAllByRole('img', {
        hidden: true,
        name: 'Modal Section Delete Icon',
      })[4],
    );
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);

    expect(operation.variables.attributes.emailAddresses[1].destroy).toEqual(
      true,
    );
  });

  it('should handle editing show more section', async () => {
    const mutationSpy = jest.fn();
    const newPersonAlmaMater = 'Some Cool School';
    const newPersonEmployer = 'Cru';
    const newPersonOccupation = 'Dev';
    const newPersonLegalFirstName = 'Jim';
    const { getByText, getByRole } = render(
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
    userEvent.click(getByText('Show More'));

    userEvent.clear(getByRole('textbox', { hidden: true, name: 'Alma Mater' }));
    userEvent.clear(getByRole('textbox', { hidden: true, name: 'Employer' }));
    userEvent.clear(getByRole('textbox', { hidden: true, name: 'Occupation' }));
    userEvent.clear(
      getByRole('textbox', { hidden: true, name: 'Legal First Name' }),
    );

    userEvent.click(
      getByRole('button', { hidden: true, name: 'Relationship Status' }),
    );
    userEvent.click(getByRole('option', { hidden: true, name: 'Married' }));
    userEvent.click(getByRole('button', { hidden: true, name: 'Gender' }));
    userEvent.click(getByRole('option', { hidden: true, name: 'Female' }));
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Alma Mater' }),
      newPersonAlmaMater,
    );
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Employer' }),
      newPersonEmployer,
    );
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Occupation' }),
      newPersonOccupation,
    );
    userEvent.type(
      getByRole('textbox', { hidden: true, name: 'Legal First Name' }),
      newPersonLegalFirstName,
    );
    userEvent.click(getByRole('checkbox', { hidden: true, name: 'Deceased' }));
    userEvent.click(getByText('Show Less'));
    userEvent.click(getByText('Save'));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.maritalStatus).toEqual('Married');
    expect(operation.variables.attributes.gender).toEqual('Female');
    expect(operation.variables.attributes.almaMater).toEqual(
      newPersonAlmaMater,
    );
    expect(operation.variables.attributes.employer).toEqual(newPersonEmployer);
    expect(operation.variables.attributes.occupation).toEqual(
      newPersonOccupation,
    );
    expect(operation.variables.attributes.legalFirstName).toEqual(
      newPersonLegalFirstName,
    );
    expect(operation.variables.attributes.deceased).toEqual(false);
  });

  it('should handle editing anniversary', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
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
    userEvent.click(getByText('Show More'));
    userEvent.click(
      getByRole('textbox', { hidden: true, name: 'Anniversary' }),
    );
    userEvent.click(getByText('30'));
    const AnniversaryOkayButton = await waitFor(() => getByText('OK'));
    userEvent.click(AnniversaryOkayButton);
    userEvent.click(getByText('Show Less'));
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.anniversaryDay).toEqual(30);
  });

  it('should handle editing birthday', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
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
    userEvent.click(getByText('Show More'));
    userEvent.click(getByRole('textbox', { hidden: true, name: 'Birthday' }));
    userEvent.click(getByText('30'));
    const birthdayOkayButton = await waitFor(() => getByText('OK'));
    userEvent.click(birthdayOkayButton);

    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.birthdayDay).toEqual(30);
  });

  it('should handle editing socials section', async () => {
    const mutationSpy = jest.fn();
    const newPersonFacebookAccount = 'Test Guy';
    const newPersonTwitterAccount = '@testguy';
    const newPersonLinkedInAccount = 'Professional Test Guy';
    const newPersonWebsite = 'testguy.com';
    const { getByText, getAllByRole } = render(
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
    userEvent.click(getByText('Show More'));

    userEvent.clear(
      getAllByRole('textbox', { hidden: true, name: 'Facebook Account' })[0],
    );
    userEvent.clear(
      getAllByRole('textbox', { hidden: true, name: 'Twitter Account' })[0],
    );
    userEvent.clear(
      getAllByRole('textbox', { hidden: true, name: 'LinkedIn Account' })[0],
    );
    userEvent.clear(
      getAllByRole('textbox', { hidden: true, name: 'Website' })[0],
    );

    userEvent.type(
      getAllByRole('textbox', { hidden: true, name: 'Facebook Account' })[0],
      newPersonFacebookAccount,
    );
    userEvent.type(
      getAllByRole('textbox', { hidden: true, name: 'Twitter Account' })[0],
      newPersonTwitterAccount,
    );
    userEvent.type(
      getAllByRole('textbox', { hidden: true, name: 'LinkedIn Account' })[0],
      newPersonLinkedInAccount,
    );
    userEvent.type(
      getAllByRole('textbox', { hidden: true, name: 'Website' })[0],
      newPersonWebsite,
    );
    userEvent.click(getByText('Show Less'));
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.facebookAccounts[0].username).toEqual(
      newPersonFacebookAccount,
    );
    expect(
      operation.variables.attributes.twitterAccounts[0].screenName,
    ).toEqual(newPersonTwitterAccount);
    expect(
      operation.variables.attributes.linkedinAccounts[0].publicUrl,
    ).toEqual(newPersonLinkedInAccount);
    expect(operation.variables.attributes.websites[0].url).toEqual(
      newPersonWebsite,
    );
  });

  it('should handle deleting socials', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getAllByRole } = render(
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
    userEvent.click(getByText('Show More'));
    userEvent.click(
      getAllByRole('img', {
        hidden: true,
        name: 'Modal Section Delete Icon',
      })[6],
    );
    userEvent.click(
      getAllByRole('img', {
        hidden: true,
        name: 'Modal Section Delete Icon',
      })[8],
    );
    userEvent.click(
      getAllByRole('img', {
        hidden: true,
        name: 'Modal Section Delete Icon',
      })[10],
    );
    userEvent.click(
      getAllByRole('img', {
        hidden: true,
        name: 'Modal Section Delete Icon',
      })[12],
    );

    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      }),
    );
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.facebookAccounts[1].destroy).toEqual(
      true,
    );
    expect(operation.variables.attributes.twitterAccounts[1].destroy).toEqual(
      true,
    );
    expect(operation.variables.attributes.linkedinAccounts[1].destroy).toEqual(
      true,
    );
    expect(operation.variables.attributes.websites[1].destroy).toEqual(true);
  });
});
