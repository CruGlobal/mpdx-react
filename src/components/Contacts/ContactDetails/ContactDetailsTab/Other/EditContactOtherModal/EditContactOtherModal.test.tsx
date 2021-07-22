import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { PreferredContactMethodEnum } from '../../../../../../../graphql/types.generated';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import { ContactDetailsTabQuery } from '../../ContactDetailsTab.generated';
import {
  ContactPeopleFragment,
  ContactPeopleFragmentDoc,
} from '../../People/ContactPeople.generated';
import { UpdateContactOtherMutation } from './EditContactOther.generated';
import { EditContactOtherModal } from './EditContactOtherModal';

const handleClose = jest.fn();
const mock = gqlMock<ContactPeopleFragment>(ContactPeopleFragmentDoc);
const contactId = '123';
const accountListId = 'abc';

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

const mockContact: ContactDetailsTabQuery['contact'] = {
  name: 'test person',
  id: contactId,
  tagList: [],
  timezone: '(GMT-05:00) Eastern Time (US & Canada)',
  locale: 'English',
  preferredContactMethod: PreferredContactMethodEnum.PhoneCall,
  churchName: 'A Great Church',
  website: 'coolwebsite.com',
  people: {
    nodes: [
      {
        ...mock.people.nodes[0],
        firstName: 'test',
        lastName: 'guy',
        id: mock.primaryPerson?.id ?? '',
      },
      ...mock.people.nodes,
    ],
  },
  primaryPerson: mock.primaryPerson,
};

describe('EditContactOtherModal', () => {
  it('should render edit contact other modal', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactOtherMutation>>
            <EditContactOtherModal
              accountListId={accountListId}
              isOpen={true}
              handleClose={handleClose}
              contact={mockContact}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Other Details')).toBeInTheDocument();
  });

  it('should close edit contact other modal', () => {
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactOtherMutation>>
            <EditContactOtherModal
              accountListId={accountListId}
              isOpen={true}
              handleClose={handleClose}
              contact={mockContact}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Other Details')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactOtherMutation>>
            <EditContactOtherModal
              accountListId={accountListId}
              isOpen={true}
              handleClose={handleClose}
              contact={mockContact}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Edit Contact Other Details')).toBeInTheDocument();
    userEvent.click(getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should edit contact other details', async () => {
    const mutationSpy = jest.fn();
    const newChurchName = 'Great Cool Church II';
    const newWebsite = 'coolwebsite2.com';
    const { getByText, getByRole } = render(
      <SnackbarProvider>
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
            <EditContactOtherModal
              accountListId={accountListId}
              isOpen={true}
              handleClose={handleClose}
              contact={mockContact}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.clear(getByRole('textbox', { name: 'Church' }));
    userEvent.clear(getByRole('textbox', { name: 'Website' }));

    userEvent.click(getByRole('button', { name: 'Preferred Contact Method' }));
    userEvent.click(getByRole('option', { name: 'WhatsApp' }));
    // userEvent.click(getByRole('button', { name: 'Language' }));
    // userEvent.click(getByRole('option', { name: 'Australian English' }));
    userEvent.click(getByRole('button', { name: 'Timezone' }));
    userEvent.click(getByRole('option', { name: '(GMT-09:00) Alaska' }));
    userEvent.type(getByRole('textbox', { name: 'Church' }), newChurchName);
    userEvent.type(getByRole('textbox', { name: 'Website' }), newWebsite);
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Contact updated successfully', {
        variant: 'success',
      }),
    );

    const { operation } = mutationSpy.mock.calls[1][0];

    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes.preferredContactMethod).toEqual(
      PreferredContactMethodEnum.WhatsApp,
    );
    // expect(operation.variables.attributes.locale).toEqual('Australian English');
    expect(operation.variables.attributes.timezone).toEqual(
      '(GMT-09:00) Alaska',
    );
    expect(operation.variables.attributes.churchName).toEqual(newChurchName);
    expect(operation.variables.attributes.website).toEqual(newWebsite);
  });

  it('should handle errors with editing contact other details', async () => {
    const newChurchName = 'Great Cool Church II';
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<UpdateContactOtherMutation>
            mocks={{
              UpdateContactOther: {
                updateContact: {
                  contact: new GraphQLError(
                    'GraphQL Error #42: Error updating contact.',
                  ),
                },
              },
            }}
          >
            <EditContactOtherModal
              accountListId={accountListId}
              isOpen={true}
              handleClose={handleClose}
              contact={mockContact}
            />
          </GqlMockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.clear(getByRole('textbox', { name: 'Church' }));
    userEvent.type(getByRole('textbox', { name: 'Church' }), newChurchName);
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'GraphQL Error #42: Error updating contact.',
        {
          variant: 'error',
        },
      ),
    );
  });
});
