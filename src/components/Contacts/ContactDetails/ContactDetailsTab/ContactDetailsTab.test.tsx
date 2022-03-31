import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import TestRouter from '../../../../../__tests__/util/TestRouter';
import theme from '../../../../theme';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsTab } from './ContactDetailsTab';
import { ContactDetailsTabQuery } from './ContactDetailsTab.generated';

const accountListId = '111';
const contactId = 'contact-1';
const router = {
  query: { searchTerm: undefined, accountListId },
  push: jest.fn(),
};
const onContactSelected = jest.fn();

const mocks = {
  ContactDetailsTab: {
    contact: {
      id: contactId,
      name: 'Person, Test',
      addresses: {
        nodes: [
          {
            id: '123',
            street: '123 Sesame Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
            primaryMailingAddress: true,
          },
          {
            id: '321',
            street: '4321 Sesame Street',
            city: 'Florida',
            state: 'FL',
            postalCode: '10001',
            country: 'USA',
            primaryMailingAddress: false,
          },
        ],
      },
      tagList: ['tag1', 'tag2', 'tag3'],
      people: {
        nodes: [
          {
            id: contactId,
            firstName: 'Test',
            lastName: 'Person',
            primaryPhoneNumber: { number: '555-555-5555' },
            primaryEmailAddress: {
              email: 'testperson@fake.com',
            },
          },
        ],
      },
      website: 'testperson.com',
    },
  },
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

describe('ContactDetailTab', () => {
  it('loading', () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<ContactDetailsTabQuery>>
              <ContactDetailsTab
                accountListId={accountListId}
                contactId={contactId}
                onContactSelected={onContactSelected}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    expect(queryByText('Loading')).toBeInTheDocument();
  });

  it('should render contact details', async () => {
    const { queryAllByText, queryByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
              <ContactDetailsTab
                accountListId={accountListId}
                contactId={contactId}
                onContactSelected={onContactSelected}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    expect(queryAllByText('Person, Test')[0]).toBeInTheDocument();
    expect(queryByText('Test Person')).toBeInTheDocument();
    expect(queryByText('testperson@fake.com')).toBeInTheDocument();
    expect(queryByText('555-555-5555')).toBeInTheDocument();
    expect(queryByText('123 Sesame Street')).toBeInTheDocument();
  });

  it('should close delete modal', async () => {
    const { queryByText, queryAllByText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<ContactDetailsTabQuery>>
              <ContactDetailsTab
                accountListId={accountListId}
                contactId={contactId}
                onContactSelected={onContactSelected}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(queryAllByText('delete contact')[0]);
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Delete Contact')).not.toBeInTheDocument(),
    );
  });

  it('should open edit contact details modal', async () => {
    const { queryByText, getAllByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByLabelText('Edit Icon')[0]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).toBeInTheDocument(),
    );
  });

  it('should close edit contact details modal', async () => {
    const { queryByText, getAllByLabelText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByLabelText('Edit Icon')[0]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).toBeInTheDocument(),
    );
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Edit Contact Details')).not.toBeInTheDocument(),
    );
  });

  it('should open edit person modal', async () => {
    const { queryByText, getAllByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByLabelText('Edit Icon')[1]);
    await waitFor(() => expect(queryByText('Edit Person')).toBeInTheDocument());
  });

  it('should close edit person modal', async () => {
    const { queryByText, getAllByLabelText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByLabelText('Edit Icon')[1]);
    await waitFor(() => expect(queryByText('Edit Person')).toBeInTheDocument());
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Edit Person')).not.toBeInTheDocument(),
    );
  });

  it('should open create person modal', async () => {
    const { queryByText, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getByText('Add Person'));
    await waitFor(() =>
      expect(queryByText('Create Person')).toBeInTheDocument(),
    );
  });

  it('should close create person modal', async () => {
    const { queryByText, getByText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getByText('Add Person'));
    await waitFor(() =>
      expect(queryByText('Create Person')).toBeInTheDocument(),
    );
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Create Person')).not.toBeInTheDocument(),
    );
  });

  it('should open create address modal', async () => {
    const { queryByText, getByText, getAllByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() => expect(getAllByText('Add Address').length).toBe(1));
    userEvent.click(getByText('Add Address'));
    await waitFor(() => expect(getAllByText('Add Address').length).toBe(2));
  });

  it('should close create address modal', async () => {
    const { queryByText, getByText, getByLabelText, getAllByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery>>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getByText('Add Address'));
    await waitFor(() => expect(getAllByText('Add Address').length).toBe(2));
    userEvent.click(getByLabelText('Close'));
    await waitFor(() => expect(getAllByText('Add Address').length).toBe(1));
  });

  it('should open edit contact mailing modal', async () => {
    const { queryByText, getAllByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByLabelText('Edit Icon')[3]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Mailing Details')).toBeInTheDocument(),
    );
  });

  it('should close edit contact mailing modal', async () => {
    const { queryByText, getAllByLabelText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByLabelText('Edit Icon')[3]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Mailing Details')).toBeInTheDocument(),
    );
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(
        queryByText('Edit Contact Mailing Details'),
      ).not.toBeInTheDocument(),
    );
  });

  it('should open edit contact address modal', async () => {
    const { queryByText, getAllByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByLabelText('Edit Icon')[4]);
    await waitFor(() =>
      expect(queryByText('Edit Address')).toBeInTheDocument(),
    );
  });

  it('should close edit contact address modal', async () => {
    const { queryByText, getAllByLabelText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByLabelText('Edit Icon')[4]);
    await waitFor(() =>
      expect(queryByText('Edit Address')).toBeInTheDocument(),
    );
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Edit Address')).not.toBeInTheDocument(),
    );
  });

  it('should open show more section | Addresses', async () => {
    const { queryByText, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getByText('Show More'));
    await waitFor(() =>
      expect(getByText('4321 Sesame Street')).toBeInTheDocument(),
    );
  });

  it('should close show more section | Addresses', async () => {
    const { queryByText, getByText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getByText('Show More'));
    await waitFor(() =>
      expect(getByText('4321 Sesame Street')).toBeInTheDocument(),
    );
    userEvent.click(getByText('Show Less'));
    await waitFor(() =>
      expect(queryByText('4321 Sesame Street')).not.toBeInTheDocument(),
    );
  });

  it('should open edit contact addresses from show more section | Addresses', async () => {
    const { queryByText, getByText, getAllByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getByText('Show More'));
    await waitFor(() =>
      expect(getByText('4321 Sesame Street')).toBeInTheDocument(),
    );
    userEvent.click(getAllByLabelText('Edit Icon')[5]);
    await waitFor(() =>
      expect(queryByText('Edit Address')).toBeInTheDocument(),
    );
  });

  it('should open edit contact other details modal', async () => {
    const { queryByText, getAllByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByLabelText('Edit Icon')[5]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Other Details')).toBeInTheDocument(),
    );
  });

  it('should close edit contact other details modal', async () => {
    const { queryByText, getAllByLabelText, getByLabelText } = render(
      <SnackbarProvider>
        <TestRouter router={router}>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<ContactDetailsTabQuery> mocks={mocks}>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </MuiPickersUtilsProvider>
        </TestRouter>
      </SnackbarProvider>,
    );
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.click(getAllByLabelText('Edit Icon')[5]);
    await waitFor(() =>
      expect(queryByText('Edit Contact Other Details')).toBeInTheDocument(),
    );
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Edit Contact Other Details')).not.toBeInTheDocument(),
    );
  });
});
