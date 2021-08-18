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
    const { getByText, getByLabelText } = render(
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
    userEvent.click(getByLabelText('Close'));
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
    const { getByText, getByLabelText } = render(
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
    const { getByText, getByLabelText } = render(
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

    userEvent.clear(getByLabelText('Church'));
    userEvent.type(getByLabelText('Church'), newChurchName);
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
