import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
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
  avatar: '',
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
const handleSingleConfirm = jest.fn();
const mockEnqueue = jest.fn();

jest.mock('src/hooks/useGetAppSettings');
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

const defaultDataState = {
  contactTestId: {
    emailAddresses: person.emailAddresses.nodes as EmailAddressData[],
  },
} as { [key: string]: PersonEmailAddresses };

type TestComponentProps = {
  mocks?: ApolloErgonoMockMap;
  dataState?: { [key: string]: PersonEmailAddresses };
};

const TestComponent = ({
  mocks,
  dataState = defaultDataState,
}: TestComponentProps) => {
  const handleChangeMock = jest.fn();
  const handleChangePrimaryMock = jest.fn();

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
              accountListId={accountListId}
              handleChange={handleChangeMock}
              handleChangePrimary={handleChangePrimaryMock}
              handleSingleConfirm={handleSingleConfirm}
              setContactFocus={setContactFocus}
            />
          </GqlMockedProvider>
        </TestWrapper>
      </ThemeProvider>
    </SnackbarProvider>
  );
};

describe('FixEmailAddressPerson', () => {
  beforeEach(() => {
    (useGetAppSettings as jest.Mock).mockReturnValue({
      appName: 'MPDX',
    });
  });

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

  describe('confirm button', () => {
    it('should disable confirm button if there is more than one primary email', async () => {
      const dataState = {
        contactTestId: {
          emailAddresses: [
            {
              ...person.emailAddresses.nodes[0],
              primary: true,
            },
            {
              ...person.emailAddresses.nodes[1],
              primary: true,
            },
          ] as EmailAddressData[],
        },
      };

      const { getByRole, queryByRole } = render(
        <TestComponent dataState={dataState} />,
      );

      await waitFor(() => {
        expect(queryByRole('loading')).not.toBeInTheDocument();
        expect(getByRole('button', { name: 'Confirm' })).toBeDisabled();
      });
    });

    it('should disable confirm button if there are no primary emails', async () => {
      const dataState = {
        contactTestId: {
          emailAddresses: [
            {
              ...person.emailAddresses.nodes[0],
              primary: false,
            },
            {
              ...person.emailAddresses.nodes[1],
              primary: false,
            },
          ] as EmailAddressData[],
        },
      };
      const { getByRole, queryByRole } = render(
        <TestComponent dataState={dataState} />,
      );

      await waitFor(() => {
        expect(queryByRole('loading')).not.toBeInTheDocument();
        expect(getByRole('button', { name: 'Confirm' })).toBeDisabled();
      });
    });

    it('should not disable confirm button if there is exactly one primary email', async () => {
      const { getByRole, queryByRole } = render(<TestComponent />);

      expect(handleSingleConfirm).toHaveBeenCalledTimes(0);

      await waitFor(() => {
        expect(queryByRole('loading')).not.toBeInTheDocument();
        expect(getByRole('button', { name: 'Confirm' })).not.toBeDisabled();
      });

      userEvent.click(getByRole('button', { name: 'Confirm' }));

      expect(handleSingleConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
