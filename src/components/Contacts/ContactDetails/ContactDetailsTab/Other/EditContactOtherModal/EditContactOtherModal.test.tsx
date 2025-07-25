import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { ContactOptionsQuery } from 'src/components/Task/Modal/Form/Inputs/ContactsAutocomplete/ContactsAutocomplete.generated';
import { PreferredContactMethodEnum } from 'src/graphql/types.generated';
import theme from '../../../../../../theme';
import { ContactDetailProvider } from '../../../ContactDetailContext';
import {
  ContactOtherFragment,
  ContactOtherFragmentDoc,
} from '../ContactOther.generated';
import { UpdateContactOtherMutation } from './EditContactOther.generated';
import { EditContactOtherModal } from './EditContactOtherModal';

const handleClose = jest.fn();
const mock = gqlMock<ContactOtherFragment>(ContactOtherFragmentDoc);
const contactId = '123';
const accountListId = 'abc';
const referral = {
  id: '456',
  referredBy: {
    id: '789',
    name: 'def',
  },
};

const router = {
  query: { accountListId },
};

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

const mockContact: ContactOtherFragment = {
  id: contactId,
  timezone: '(GMT-05:00) Eastern Time (US & Canada)',
  locale: 'English',
  preferredContactMethod: PreferredContactMethodEnum.PhoneCall,
  churchName: mock.churchName,
  website: mock.website,
  user: { id: 'user-1' },
  greeting: mock.greeting,
  envelopeGreeting: mock.envelopeGreeting,
  contactReferralsToMe: mock.contactReferralsToMe,
};

describe('EditContactOtherModal', () => {
  it('should render edit contact other modal', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <EditContactOtherModal
                  accountListId={accountListId}
                  isOpen={true}
                  handleClose={handleClose}
                  contact={mockContact}
                  referral={referral}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Other Details')).toBeInTheDocument();
  });

  it('should load contact data', async () => {
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              ContactOptions: ContactOptionsQuery;
            }>
              mocks={{
                ContactOptions: {
                  contacts: {
                    nodes: [
                      {
                        id: '111',
                        name: 'Aaa Bbb',
                      },
                      {
                        id: '222',
                        name: 'Ccc Ddd',
                      },
                    ],
                  },
                },
              }}
            >
              <ContactDetailProvider>
                <EditContactOtherModal
                  accountListId={accountListId}
                  isOpen={true}
                  handleClose={handleClose}
                  contact={mockContact}
                  referral={referral}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Other Details')).toBeInTheDocument();
    const referredByElement = getByRole('combobox', {
      hidden: true,
      name: 'Connecting Partner',
    });
    userEvent.click(referredByElement);
    await waitFor(() => expect(getByText('Ccc Ddd')).toBeInTheDocument());
    userEvent.type(referredByElement, 'Aa');
    await waitFor(() => expect(getByText('Aaa Bbb')).toBeInTheDocument());
    userEvent.click(getByText('Aaa Bbb'));
  });

  it('should load church data', async () => {
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              ContactOptions: ContactOptionsQuery;
            }>
              mocks={{
                ChurchOptions: {
                  accountList: {
                    churches: ['Big Church', 'test5567'],
                  },
                },
              }}
            >
              <ContactDetailProvider>
                <EditContactOtherModal
                  accountListId={accountListId}
                  isOpen={true}
                  handleClose={handleClose}
                  contact={mockContact}
                  referral={referral}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Other Details')).toBeInTheDocument();
    const churchElement = getByRole('combobox', {
      hidden: true,
      name: 'Church',
    });
    userEvent.click(churchElement);
    await waitFor(() => expect(getByText('Big Church')).toBeInTheDocument());
    userEvent.clear(churchElement);
    userEvent.type(churchElement, 'te');
    await waitFor(() => expect(getByText('test5567')).toBeInTheDocument());
  });

  it('should close edit contact other modal', () => {
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <EditContactOtherModal
                  accountListId={accountListId}
                  isOpen={true}
                  handleClose={handleClose}
                  contact={mockContact}
                  referral={referral}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Other Details')).toBeInTheDocument();
    userEvent.click(getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactDetailProvider>
                <EditContactOtherModal
                  accountListId={accountListId}
                  isOpen={true}
                  handleClose={handleClose}
                  contact={mockContact}
                  referral={referral}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Other Details')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle empty referral', async () => {
    const mutationSpy = jest.fn();
    await act(async () => {
      render(
        <SnackbarProvider>
          <TestRouter router={router}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider onCall={mutationSpy}>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={undefined}
                  />
                </ContactDetailProvider>
              </GqlMockedProvider>
            </ThemeProvider>
          </TestRouter>
        </SnackbarProvider>,
      );
    });

    const getFilteredContactsCalls = mutationSpy.mock.calls
      .map(([{ operation }]) => operation)
      .filter(({ operationName }) => operationName === 'ContactOptions');
    // Test that the search by id and search by name calls are merged into one query when the referral is missing
    expect(getFilteredContactsCalls).toHaveLength(1);
    // Test that contactsFilters.ids isn't ever [undefined]
    getFilteredContactsCalls.forEach(({ variables }) => {
      expect(variables.contactsFilters.ids).toBeUndefined();
    });
  });

  it('should handle editing the referred by | Create', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              UpdateContactOther: UpdateContactOtherMutation;
            }>
              mocks={{
                ContactOptions: {
                  contacts: {
                    nodes: [
                      {
                        id: 'contact-1',
                        name: 'Person, Cool',
                      },
                      {
                        id: 'contact-2',
                        name: 'Guy, Great',
                      },
                    ],
                  },
                },
              }}
            >
              <EditContactOtherModal
                accountListId={accountListId}
                isOpen={true}
                handleClose={handleClose}
                contact={{ ...mockContact, preferredContactMethod: null }}
                referral={undefined}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    const referredByInput = getByLabelText('Connecting Partner');
    await waitFor(() => expect(referredByInput).toBeInTheDocument());
    userEvent.click(referredByInput);
    userEvent.type(referredByInput, 'G');
    await waitFor(() => expect(getByText('Guy, Great')).toBeInTheDocument());
    userEvent.click(getByText('Guy, Great'));
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contact updated successfully', {
        variant: 'success',
      }),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle editing the referred by | No Contacts or Referrals', async () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              UpdateContactOther: UpdateContactOtherMutation;
            }>
              mocks={{
                ContactOptions: {
                  contacts: {
                    nodes: [],
                  },
                },
              }}
            >
              <EditContactOtherModal
                accountListId={accountListId}
                isOpen={true}
                handleClose={handleClose}
                contact={{ ...mockContact, preferredContactMethod: null }}
                referral={undefined}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>,
    );

    const referredByInput = getByLabelText('Connecting Partner');
    await waitFor(() => expect(referredByInput).toBeInTheDocument());
    userEvent.click(referredByInput);
    expect(getByText('No options')).toBeInTheDocument();
  });

  it('should handle empty contact method', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider onCall={mutationSpy}>
              <ContactDetailProvider>
                <EditContactOtherModal
                  accountListId={accountListId}
                  isOpen={true}
                  handleClose={handleClose}
                  contact={{ ...mockContact, preferredContactMethod: null }}
                  referral={undefined}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    userEvent.click(getByLabelText('Preferred Contact Method'));
    userEvent.click(getByText('None'));
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contact updated successfully', {
        variant: 'success',
      }),
    );

    const saveContactCalls = mutationSpy.mock.calls
      .map(([{ operation }]) => operation)
      .filter(({ operationName }) => operationName === 'UpdateContactOther');

    expect(saveContactCalls).toHaveLength(1);
    expect(saveContactCalls[0].variables.attributes).toMatchObject({
      preferredContactMethod: null,
    });
  });

  it('should edit contact other details', async () => {
    const mutationSpy = jest.fn();
    const newChurchName = 'Great Cool Church II';
    const newWebsite = 'coolwebsite2.com';
    const newGreeting = 'New Name';
    const newEnvelopeGreeting = 'New Full Name';
    const { getByText, getByLabelText, getByRole, findByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              UpdateContactOther: UpdateContactOtherMutation;
            }>
              onCall={mutationSpy}
              mocks={{
                AssigneeOptions: {
                  accountListUsers: {
                    nodes: [
                      {
                        user: {
                          id: 'user-1',
                          firstName: 'John',
                          lastName: 'Doe',
                        },
                      },
                      {
                        user: {
                          id: 'user-2',
                          firstName: 'Jane',
                          lastName: 'Doe',
                        },
                      },
                    ],
                  },
                },
              }}
            >
              <ContactDetailProvider>
                <EditContactOtherModal
                  accountListId={accountListId}
                  isOpen={true}
                  handleClose={handleClose}
                  contact={mockContact}
                  referral={referral}
                />
              </ContactDetailProvider>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    userEvent.click(getByRole('combobox', { name: 'Assignee' }));
    userEvent.click(await findByRole('option', { name: 'Jane Doe' }));

    const church = getByLabelText('Church');
    userEvent.clear(getByLabelText('Website'));

    userEvent.click(getByLabelText('Preferred Contact Method'));
    userEvent.click(getByLabelText('WhatsApp'));
    userEvent.click(getByLabelText('Language'));
    userEvent.click(await findByRole('option', { name: 'Australian English' }));
    userEvent.click(getByLabelText('Timezone'));
    userEvent.click(getByText('(GMT-09:00) Alaska'));
    userEvent.clear(church);
    userEvent.type(church, newChurchName);
    userEvent.type(getByLabelText('Website'), newWebsite);

    const greetingInput = getByLabelText('Greeting');
    expect(greetingInput).toHaveValue(mockContact.greeting);
    userEvent.clear(greetingInput);
    userEvent.type(greetingInput, newGreeting);

    const envelopeGreetingInput = getByLabelText('Envelope Name Line');
    expect(envelopeGreetingInput).toHaveValue(mockContact.envelopeGreeting);
    userEvent.clear(envelopeGreetingInput);
    userEvent.type(envelopeGreetingInput, newEnvelopeGreeting);

    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contact updated successfully', {
        variant: 'success',
      }),
    );

    expect(mutationSpy).toHaveGraphqlOperation('UpdateContactOther', {
      accountListId,
      attributes: {
        preferredContactMethod: PreferredContactMethodEnum.WhatsApp,
        locale: 'en-AU',
        timezone: '(GMT-09:00) Alaska',
        churchName: newChurchName,
        website: newWebsite,
        userId: 'user-2',
        greeting: newGreeting,
        envelopeGreeting: newEnvelopeGreeting,
        contactReferralsToMe: [{}],
      },
    });
  });
});
