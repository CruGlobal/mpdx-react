import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { ContactOptionsQuery } from 'src/components/Task/Modal/Form/Inputs/ContactsAutocomplete/ContactsAutocomplete.generated';
import { PreferredContactMethodEnum } from 'src/graphql/types.generated';
import {
  GqlMockedProvider,
  gqlMock,
} from '../../../../../../../__tests__/util/graphqlMocking';
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
  contactReferralsToMe: mock.contactReferralsToMe,
};

describe('EditContactOtherModal', () => {
  it('should render edit contact other modal', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsWrapper>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
              <ContactsWrapper>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Other Details')).toBeInTheDocument();
    const referredByElement = getByRole('combobox', {
      hidden: true,
      name: 'Referred By',
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
              <ContactsWrapper>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
              <ContactsWrapper>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
              <ContactsWrapper>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
                <ContactsWrapper>
                  <ContactDetailProvider>
                    <EditContactOtherModal
                      accountListId={accountListId}
                      isOpen={true}
                      handleClose={handleClose}
                      contact={mockContact}
                      referral={undefined}
                    />
                  </ContactDetailProvider>
                </ContactsWrapper>
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

  it('should handle empty contact method', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider onCall={mutationSpy}>
              <ContactsWrapper>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={{ ...mockContact, preferredContactMethod: null }}
                    referral={undefined}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
    const { getByText, getByLabelText, getByRole, findByRole } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<{
              UpdateContactOther: UpdateContactOtherMutation;
            }>
              onCall={mutationSpy}
              mocks={{
                LoadConstants: {
                  constant: {
                    languages: [
                      {
                        id: 'en',
                        value: 'English',
                      },
                      {
                        id: 'elx',
                        value: 'Greek',
                      },
                      {
                        id: 'eka',
                        value: 'Ekajuk',
                      },
                      {
                        id: 'en-AU',
                        value: 'Australian English',
                      },
                    ],
                  },
                },
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
              <ContactsWrapper>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsWrapper>
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
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contact updated successfully', {
        variant: 'success',
      }),
    );

    const { operation } = mutationSpy.mock.calls[6][0];
    expect(operation).toMatchObject({
      operationName: 'UpdateContactOther',
      variables: {
        accountListId,
        attributes: {
          preferredContactMethod: PreferredContactMethodEnum.WhatsApp,
          locale: 'Australian English',
          timezone: '(GMT-09:00) Alaska',
          churchName: newChurchName,
          website: newWebsite,
          userId: 'user-2',
          contactReferralsToMe: [{}],
        },
      },
    });
  });
});
