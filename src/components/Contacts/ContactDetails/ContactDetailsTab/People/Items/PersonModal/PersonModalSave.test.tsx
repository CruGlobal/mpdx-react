import React from 'react';
import { InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ContactDetailProvider } from 'src/components/Contacts/ContactDetails/ContactDetailContext';
import {
  GqlMockedProvider,
  gqlMock,
} from '../../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../../theme';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../ContactPeople.generated';
import { PersonModal } from './PersonModal';
import { uploadAvatar, validateAvatar } from './uploadAvatar';

jest.mock('./uploadAvatar');

const handleClose = jest.fn();
const accountListId = '123';
const contactId = '321';
const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc, {
  mocks: {
    people: {
      nodes: [
        {
          id: '01234',
          firstName: 'Jill',
          deceased: false,
          emailAddresses: {
            nodes: [],
          },
          phoneNumbers: {
            nodes: [],
          },
          facebookAccounts: {
            nodes: [],
          },
          twitterAccounts: {
            nodes: [],
          },
          linkedinAccounts: {
            nodes: [],
          },
          websites: {
            nodes: [],
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
        },
        {
          id: '56789',
          firstName: 'Jack',
          deceased: false,
          emailAddresses: {
            nodes: [],
          },
          phoneNumbers: {
            nodes: [],
          },
          facebookAccounts: {
            nodes: [],
          },
          twitterAccounts: {
            nodes: [],
          },
          linkedinAccounts: {
            nodes: [],
          },
          websites: {
            nodes: [],
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

const components = (mutationSpy, contactData) => (
  <SnackbarProvider>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <ContactDetailProvider>
            <PersonModal
              contactId={contactId}
              accountListId={accountListId}
              handleClose={handleClose}
              person={mockPerson}
              contactData={contactData}
            />
          </ContactDetailProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </LocalizationProvider>
  </SnackbarProvider>
);

describe('PersonModal - Saving Deceased', () => {
  const cache = new InMemoryCache();
  jest.spyOn(cache, 'readQuery');
  jest.spyOn(cache, 'writeQuery');
  beforeEach(() => {
    (uploadAvatar as jest.Mock).mockResolvedValue(undefined);
    (validateAvatar as jest.Mock).mockReturnValue({ success: true });
  });

  it('deceases Jill and updates greetings (Jill listed last)', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByLabelText } = render(
      components(mutationSpy, {
        id: '123-456',
        name: 'Hill, Jack and Jill',
        people: mock.people,
        greeting: 'Jack and Jill',
        envelopeGreeting: 'Jack and Jill Hill',
      }),
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByText('Show More'));
    userEvent.click(getByLabelText('Deceased'));
    userEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      });
      expect(mockEnqueue).toHaveBeenCalledWith(
        "Updated contact's name and greeting information",
        {
          variant: 'success',
        },
      );
    });

    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.attributes.deceased).toEqual(true);

    const { operation: EditMailingInfoOperation } =
      mutationSpy.mock.calls[1][0];
    expect(EditMailingInfoOperation.operationName).toEqual('EditMailingInfo');
    expect(EditMailingInfoOperation.variables.accountListId).toEqual(
      accountListId,
    );
    expect(EditMailingInfoOperation.variables.attributes.id).toEqual(contactId);
    expect(EditMailingInfoOperation.variables.attributes.greeting).toEqual(
      'Jack',
    );
    expect(EditMailingInfoOperation.variables.attributes.name).toEqual(
      'Hill, Jack',
    );
    expect(
      EditMailingInfoOperation.variables.attributes.envelopeGreeting,
    ).toEqual('Jack Hill');
  });

  it('deceases Jill and updates greetings (Jill listed first)', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByLabelText } = render(
      components(mutationSpy, {
        id: '123-456',
        name: 'Hill,   Jill and Jack', // Added extra space to ensure algorithm replacing it.
        people: mock.people,
        greeting: 'Jill and Jack',
        envelopeGreeting: 'Jill and Jack Hill',
      }),
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByText('Show More'));
    userEvent.click(getByLabelText('Deceased'));
    userEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      });
      expect(mockEnqueue).toHaveBeenCalledWith(
        "Updated contact's name and greeting information",
        {
          variant: 'success',
        },
      );
    });

    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.attributes.deceased).toEqual(true);

    const { operation: EditMailingInfoOperation } =
      mutationSpy.mock.calls[1][0];
    expect(EditMailingInfoOperation.operationName).toEqual('EditMailingInfo');
    expect(EditMailingInfoOperation.variables.accountListId).toEqual(
      accountListId,
    );
    expect(EditMailingInfoOperation.variables.attributes.id).toEqual(contactId);
    expect(EditMailingInfoOperation.variables.attributes.greeting).toEqual(
      'Jack',
    );
    expect(EditMailingInfoOperation.variables.attributes.name).toEqual(
      'Hill, Jack',
    );
    expect(
      EditMailingInfoOperation.variables.attributes.envelopeGreeting,
    ).toEqual('Jack Hill');
  });

  it('deceases Jill and updates greetings (Jill listed middle)', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByLabelText } = render(
      components(mutationSpy, {
        id: '123-456',
        name: 'Hill, Bill and Jill and Jack',
        people: mock.people,
        greeting: 'Bill and Jill and Jack',
        envelopeGreeting: 'Bill and Jill and Jack Hill',
      }),
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByText('Show More'));
    userEvent.click(getByLabelText('Deceased'));
    userEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      });
      expect(mockEnqueue).toHaveBeenCalledWith(
        "Updated contact's name and greeting information",
        {
          variant: 'success',
        },
      );
      expect(mockEnqueue).not.toHaveBeenCalledWith(
        'Switched primary contact to Jack',
        {
          variant: 'success',
        },
      );
    });

    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.attributes.deceased).toEqual(true);

    const { operation: EditMailingInfoOperation } =
      mutationSpy.mock.calls[1][0];
    expect(EditMailingInfoOperation.operationName).toEqual('EditMailingInfo');
    expect(EditMailingInfoOperation.variables.accountListId).toEqual(
      accountListId,
    );
    expect(EditMailingInfoOperation.variables.attributes.id).toEqual(contactId);
    expect(EditMailingInfoOperation.variables.attributes.greeting).toEqual(
      'Bill and Jack',
    );
    expect(EditMailingInfoOperation.variables.attributes.name).toEqual(
      'Hill, Bill and Jack',
    );
    expect(
      EditMailingInfoOperation.variables.attributes.envelopeGreeting,
    ).toEqual('Bill and Jack Hill');
  });

  it('sets the new primary contact as Jill is the primary contact', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByLabelText } = render(
      components(mutationSpy, {
        id: '123-456',
        primaryPerson: mockPerson,
        name: 'Hill, Bill and Jill and Jack',
        people: mock.people,
        greeting: 'Bill and Jill and Jack',
        envelopeGreeting: 'Bill and Jill and Jack Hill',
      }),
    );
    expect(getByText('Edit Person')).toBeInTheDocument();
    userEvent.click(getByText('Show More'));
    userEvent.click(getByLabelText('Deceased'));
    userEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('Person updated successfully', {
        variant: 'success',
      });
      expect(mockEnqueue).toHaveBeenCalledWith(
        "Updated contact's name and greeting information",
        {
          variant: 'success',
        },
      );
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Switched primary contact to Jack',
        {
          variant: 'success',
        },
      );
    });

    const { operation: EditMailingInfoOperation } =
      mutationSpy.mock.calls[1][0];

    expect(EditMailingInfoOperation.operationName).toEqual('EditMailingInfo');
    expect(
      EditMailingInfoOperation.variables.attributes.primaryPersonId,
    ).toEqual(mock.people.nodes[1].id);
  });
});
