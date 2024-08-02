import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  render,
  screen,
  waitFor,
} from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { EmailAddressesMutation } from '../AddEmailAddress.generated';
import { EmailAddressData, PersonEmailAddresses } from '../FixEmailAddresses';
import {
  GetInvalidEmailAddressesQuery,
  PersonInvalidEmailFragment,
} from '../FixEmailAddresses.generated';
import { mockInvalidEmailAddressesResponse } from '../FixEmailAddressesMocks';
import { FixEmailAddressPerson } from './FixEmailAddressPerson';

const accountListId = 'accountListId';
const person: PersonInvalidEmailFragment = {
  id: 'contactTestId',
  firstName: 'Test',
  lastName: 'Contact',
  contactId: 'contactTestId',
  emailAddresses: {
    nodes: [
      {
        id: 'email1',
        source: 'DonorHub',
        updatedAt: DateTime.fromISO('2021-06-21').toString(),
        email: 'test1@test1.com',
        primary: true,
      },
      {
        id: 'email2',
        source: 'MPDX',
        updatedAt: DateTime.fromISO('2021-06-22').toString(),
        email: 'test2@test1.com',
        primary: false,
      },
    ],
  },
};

const setContactFocus = jest.fn();
const mutationSpy = jest.fn();
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

const TestComponent = ({ mocks }: { mocks: ApolloErgonoMockMap }) => {
  const handleChangeMock = jest.fn();
  const handleChangePrimaryMock = jest.fn();
  const dataState = {
    contactTestId: {
      emailAddresses: person.emailAddresses.nodes as EmailAddressData[],
    },
  } as { [key: string]: PersonEmailAddresses };

  return (
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <GqlMockedProvider<{
            GetInvalidEmailAddresses: GetInvalidEmailAddressesQuery;
            EmailAddresses: EmailAddressesMutation;
          }>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <FixEmailAddressPerson
              person={person}
              dataState={dataState}
              handleChange={handleChangeMock}
              accountListId={accountListId}
              handleChangePrimary={handleChangePrimaryMock}
              setContactFocus={setContactFocus}
            />
          </GqlMockedProvider>
        </TestWrapper>
      </ThemeProvider>
    </SnackbarProvider>
  );
};

describe('FixEmailAddressPerson', () => {
  it('default', () => {
    const { getByText, getByTestId, getByDisplayValue } = render(
      <TestComponent
        mocks={{
          GetInvalidEmailAddresses: {
            people: {
              nodes: mockInvalidEmailAddressesResponse,
            },
          },
        }}
      />,
    );

    expect(
      getByText(`${person.firstName} ${person.lastName}`),
    ).toBeInTheDocument();
    expect(getByText('DonorHub (6/21/2021)')).toBeInTheDocument();
    expect(getByTestId('textfield-contactTestId-0')).toBeInTheDocument();
    expect(getByDisplayValue('test1@test1.com')).toBeInTheDocument();
    expect(getByText('MPDX (6/22/2021)')).toBeInTheDocument();
    expect(getByTestId('textfield-contactTestId-1')).toBeInTheDocument();
    expect(getByDisplayValue('test2@test1.com')).toBeInTheDocument();
  });

  it('input reset after adding an email address', async () => {
    const { getByTestId, getByLabelText } = render(
      <TestComponent
        mocks={{
          GetInvalidEmailAddresses: {
            people: {
              nodes: mockInvalidEmailAddressesResponse,
            },
          },
        }}
      />,
    );

    const addInput = getByLabelText('New Email Address');
    const addButton = getByTestId('addButton-contactTestId');

    userEvent.type(addInput, 'new@new.com');
    await waitFor(() => {
      expect(addInput).toHaveValue('new@new.com');
    });
    userEvent.click(addButton);
    await waitFor(() => {
      expect(addInput).toHaveValue('');
    });
  });

  describe('validation', () => {
    it('should show an error message if there is no email', async () => {
      const { getByLabelText, getByTestId, getByText } = render(
        <TestComponent
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
          }}
        />,
      );

      const addInput = getByLabelText('New Email Address');
      userEvent.click(addInput);
      userEvent.tab();

      const addButton = getByTestId('addButton-contactTestId');
      await waitFor(() => {
        expect(addButton).toBeDisabled();
        expect(getByText('Please enter a valid email address')).toBeVisible();
      });
    });

    it('should show an error message if there is an invalid email', async () => {
      const { getByLabelText, getByTestId, getByText } = render(
        <TestComponent
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
          }}
        />,
      );

      const addInput = getByLabelText('New Email Address');
      userEvent.type(addInput, 'ab');
      userEvent.tab();

      const addButton = getByTestId('addButton-contactTestId');
      await waitFor(() => {
        expect(addButton).toBeDisabled();
        expect(getByText('Invalid Email Address Format')).toBeVisible();
      });
    });

    it('should not disable the add button', async () => {
      const { getByLabelText, getByTestId } = render(
        <TestComponent
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
          }}
        />,
      );

      const addInput = getByLabelText('New Email Address');
      userEvent.type(addInput, 'new@new.com');
      userEvent.tab();

      const addButton = getByTestId('addButton-contactTestId');
      await waitFor(() => {
        expect(addButton).not.toBeDisabled();
      });
    });

    it('should show delete confirmation', async () => {
      const { getByTestId, getByRole } = render(
        <TestComponent
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
          }}
        />,
      );
      await waitFor(() => getByTestId('delete-contactTestId-1'));

      userEvent.click(getByTestId('delete-contactTestId-1'));
      screen.logTestingPlaygroundURL();
      await waitFor(() => {
        expect(getByRole('heading', { name: 'Confirm' })).toBeInTheDocument();
      });
      userEvent.click(getByRole('button', { name: 'Yes' }));

      const { id, email } = person.emailAddresses.nodes[1];

      await waitFor(() => {
        expect(mutationSpy.mock.lastCall[0].operation.operationName).toEqual(
          'UpdateEmailAddresses',
        );
        expect(mutationSpy.mock.lastCall[0].operation.variables).toEqual({
          input: {
            accountListId,
            attributes: {
              id: person.id,
              emailAddresses: [
                {
                  id,
                  destroy: true,
                },
              ],
            },
          },
        });
      });

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Successfully deleted email address ${email}`,
          {
            variant: 'success',
          },
        ),
      );
    });
  });
});
