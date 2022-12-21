import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferredContactMethodEnum } from '../../../../../../../graphql/types.generated';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import {
  ContactOtherFragment,
  ContactOtherFragmentDoc,
} from '../ContactOther.generated';
import { ContactDetailProvider } from '../../../ContactDetailContext';
import { UpdateContactOtherMutation } from './EditContactOther.generated';
import { EditContactOtherModal } from './EditContactOtherModal';
import { GetTaskModalContactsFilteredQuery } from 'src/components/Task/Modal/Form/TaskModal.generated';
import TestRouter from '__tests__/util/TestRouter';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';

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

jest.mock('i18next', () => ({
  // this mock makes sure any components using the translate function can use it without a warning being shown
  t: (str: string) => str,
}));

const mockContact: ContactOtherFragment = {
  name: mock.name,
  id: contactId,
  timezone: '(GMT-05:00) Eastern Time (US & Canada)',
  locale: 'English',
  preferredContactMethod: PreferredContactMethodEnum.PhoneCall,
  churchName: mock.churchName,
  website: mock.website,
  contactReferralsToMe: mock.contactReferralsToMe,
};

describe('EditContactOtherModal', () => {
  it('should render edit contact other modal', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactOtherMutation>>
              <ContactsPage>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsPage>
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
            <GqlMockedProvider<GetTaskModalContactsFilteredQuery>
              mocks={{
                GetTaskModalContactsFiltered: {
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
              <ContactsPage>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsPage>
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

  it('should close edit contact other modal', () => {
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactOtherMutation>>
              <ContactsPage>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsPage>
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
            <GqlMockedProvider<UpdateContactOtherMutation>>
              <ContactsPage>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsPage>
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
              <GqlMockedProvider<UpdateContactOtherMutation>
                onCall={mutationSpy}
              >
                <ContactsPage>
                  <ContactDetailProvider>
                    <EditContactOtherModal
                      accountListId={accountListId}
                      isOpen={true}
                      handleClose={handleClose}
                      contact={mockContact}
                      referral={undefined}
                    />
                  </ContactDetailProvider>
                </ContactsPage>
              </GqlMockedProvider>
            </ThemeProvider>
          </TestRouter>
        </SnackbarProvider>,
      );
    });

    const getFilteredContactsCalls = mutationSpy.mock.calls
      .map(([{ operation }]) => operation)
      .filter(
        ({ operationName }) => operationName === 'GetTaskModalContactsFiltered',
      );
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
            <GqlMockedProvider<UpdateContactOtherMutation> onCall={mutationSpy}>
              <ContactsPage>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={{ ...mockContact, preferredContactMethod: null }}
                    referral={undefined}
                  />
                </ContactDetailProvider>
              </ContactsPage>
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
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<UpdateContactOtherMutation>
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
              }}
            >
              <ContactsPage>
                <ContactDetailProvider>
                  <EditContactOtherModal
                    accountListId={accountListId}
                    isOpen={true}
                    handleClose={handleClose}
                    contact={mockContact}
                    referral={referral}
                  />
                </ContactDetailProvider>
              </ContactsPage>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );

    userEvent.clear(getByLabelText('Church'));
    userEvent.clear(getByLabelText('Website'));

    userEvent.click(getByLabelText('Preferred Contact Method'));
    userEvent.click(getByLabelText('WhatsApp'));
    // userEvent.click(getByLabelText('Language'));
    // userEvent.click(getByLabelText('Australian English'));
    userEvent.click(getByLabelText('Timezone'));
    userEvent.click(getByText('(GMT-09:00) Alaska'));
    userEvent.type(getByLabelText('Church'), newChurchName);
    userEvent.type(getByLabelText('Website'), newWebsite);
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contact updated successfully', {
        variant: 'success',
      }),
    );

    // const { operation } = mutationSpy.mock.calls[3][0];
    // TODO: Fix Test
    // expect(operation.variables.accountListId).toEqual(accountListId);
    // expect(operation.variables.attributes.preferredContactMethod).toEqual(
    //   PreferredContactMethodEnum.WhatsApp,
    // );
    // // expect(operation.variables.attributes.locale).toEqual('Australian English');
    // expect(operation.variables.attributes.timezone).toEqual(
    //   '(GMT-09:00) Alaska',
    // );
    // expect(operation.variables.attributes.churchName).toEqual(newChurchName);
    // expect(operation.variables.attributes.website).toEqual(newWebsite);
    // expect(operation.variables.attributes.contactReferralsToMe).toEqual([{}]);
  });
});
