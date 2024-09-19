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
import Contact, { PhoneNumberData } from './Contact';
import { mockInvalidPhoneNumbersResponse } from './FixPhoneNumbersMocks';
import {
  GetInvalidPhoneNumbersQuery,
  PersonInvalidNumberFragment,
} from './GetInvalidPhoneNumbers.generated';
import { UpdatePhoneNumberMutation } from './UpdateInvalidPhoneNumbers.generated';

const accountListId = 'accountListId';
const person: PersonInvalidNumberFragment = {
  id: 'contactTestId',
  firstName: 'Test',
  lastName: 'Contact',
  contactId: 'contactTestId',
  avatar: '',
  phoneNumbers: {
    nodes: [
      {
        id: 'email1',
        source: 'DonorHub',
        updatedAt: DateTime.fromISO('2021-06-21').toString(),
        number: '123456',
        primary: true,
      },
      {
        id: 'email2',
        source: 'MPDX',
        updatedAt: DateTime.fromISO('2021-06-22').toString(),
        number: '78910',
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
    phoneNumbers: person.phoneNumbers.nodes,
  },
} as { [key: string]: PhoneNumberData };

type TestComponentProps = {
  mocks?: ApolloErgonoMockMap;
  dataState?: { [key: string]: PhoneNumberData };
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
            GetInvalidPhoneNumbers: GetInvalidPhoneNumbersQuery;
            PhoneNumbers: UpdatePhoneNumberMutation;
          }>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <Contact
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

describe('Fix PhoneNumber Contact', () => {
  beforeEach(() => {
    (useGetAppSettings as jest.Mock).mockReturnValue({
      appName: 'MPDX',
    });
  });

  it('default', () => {
    const { getByText, getByTestId, getByDisplayValue } = render(
      <TestComponent
        mocks={{
          GetInvalidPhoneNumbers: {
            people: {
              nodes: mockInvalidPhoneNumbersResponse,
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
    expect(getByDisplayValue('123456')).toBeInTheDocument();
    expect(getByText('MPDX (6/22/2021)')).toBeInTheDocument();
    expect(getByTestId('textfield-contactTestId-1')).toBeInTheDocument();
    expect(getByDisplayValue('78910')).toBeInTheDocument();
  });

  it('input reset after adding a phone number', async () => {
    const { getByTestId, getByLabelText } = render(
      <TestComponent
        mocks={{
          GetInvalidPhoneNumbers: {
            people: {
              nodes: mockInvalidPhoneNumbersResponse,
            },
          },
        }}
      />,
    );

    const addInput = getByLabelText('New Phone Number');
    const addButton = getByTestId('addButton-contactTestId');

    userEvent.type(addInput, '000');
    await waitFor(() => {
      expect(addInput).toHaveValue('000');
    });
    userEvent.click(addButton);
    await waitFor(() => {
      expect(addInput).toHaveValue('');
    });
  });

  describe('validation', () => {
    it('should show an error message if there is no number', async () => {
      const { getByLabelText, getByTestId, getByText } = render(
        <TestComponent
          mocks={{
            GetInvalidPhoneNumbers: {
              people: {
                nodes: mockInvalidPhoneNumbersResponse,
              },
            },
          }}
        />,
      );

      const addInput = getByLabelText('New Phone Number');
      userEvent.click(addInput);
      userEvent.tab();

      const addButton = getByTestId('addButton-contactTestId');
      await waitFor(() => {
        expect(addButton).toBeDisabled();
        expect(
          getByText('This field is not a valid phone number'),
        ).toBeVisible();
      });
    });

    it('should show an error message if there is an invalid number', async () => {
      const { getByLabelText, getByTestId, getByText } = render(
        <TestComponent
          mocks={{
            GetInvalidPhoneNumbers: {
              people: {
                nodes: mockInvalidPhoneNumbersResponse,
              },
            },
          }}
        />,
      );

      const addInput = getByLabelText('New Phone Number');
      userEvent.type(addInput, 'ab');
      userEvent.tab();

      const addButton = getByTestId('addButton-contactTestId');
      await waitFor(() => {
        expect(addButton).toBeDisabled();
        expect(
          getByText('This field is not a valid phone number'),
        ).toBeVisible();
      });
    });

    it('should not disable the add button', async () => {
      const { getByLabelText, getByTestId } = render(
        <TestComponent
          mocks={{
            GetInvalidPhoneNumbers: {
              people: {
                nodes: mockInvalidPhoneNumbersResponse,
              },
            },
          }}
        />,
      );

      const addInput = getByLabelText('New Phone Number');
      userEvent.type(addInput, '123');
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
            GetInvalidPhoneNumbers: {
              people: {
                nodes: mockInvalidPhoneNumbersResponse,
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

      const { id, number } = person.phoneNumbers.nodes[1];

      await waitFor(() => {
        expect(mutationSpy.mock.lastCall[0].operation.operationName).toEqual(
          'UpdatePhoneNumber',
        );
        expect(mutationSpy.mock.lastCall[0].operation.variables).toEqual({
          input: {
            accountListId,
            attributes: {
              id: person.id,
              phoneNumbers: [
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
          `Successfully deleted phone number ${number}`,
          {
            variant: 'success',
          },
        ),
      );
    });
  });

  describe('confirm button', () => {
    it('should not disable confirm button if there is exactly one primary number', async () => {
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
