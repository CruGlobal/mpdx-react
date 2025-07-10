import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { AppSettingsProvider } from 'src/components/common/AppSettings/AppSettingsProvider';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
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
        id: 'number1',
        source: 'DataServer',
        updatedAt: DateTime.fromISO('2021-06-21').toString(),
        number: '123456',
        primary: true,
      },
      {
        id: 'number2',
        source: 'MPDX',
        updatedAt: DateTime.fromISO('2021-06-22').toString(),
        number: '78910',
        primary: false,
      },
    ],
  },
};

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

const router = {
  pathname:
    '/accountLists/[accountListId]/tools/fix/phoneNumbers/[[...contactId]]',
  query: { accountListId },
};

type TestComponentProps = {
  mocks?: ApolloErgonoMockMap;
  dataState?: { [key: string]: PhoneNumberData };
};

const TestComponent = ({ mocks }: TestComponentProps) => {
  return (
    <AppSettingsProvider>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<{
              GetInvalidPhoneNumbers: GetInvalidPhoneNumbersQuery;
              PhoneNumbers: UpdatePhoneNumberMutation;
            }>
              mocks={mocks}
              onCall={mutationSpy}
            >
              <ContactPanelProvider>
                <Contact
                  person={person}
                  accountListId={accountListId}
                  submitAll={false}
                />
              </ContactPanelProvider>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>
    </AppSettingsProvider>
  );
};

describe('Fix PhoneNumber Contact', () => {
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
    expect(getByTestId('textfield-contactTestId-number1')).toBeInTheDocument();
    expect(getByDisplayValue('123456')).toBeInTheDocument();
    expect(getByText('MPDX (6/22/2021)')).toBeInTheDocument();
    expect(getByTestId('textfield-contactTestId-number2')).toBeInTheDocument();
    expect(getByDisplayValue('78910')).toBeInTheDocument();
  });

  it('should render link with correct href', async () => {
    const { findByRole } = render(
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

    const contactName = await findByRole('link', { name: 'Test Contact' });
    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/fix/phoneNumbers/${person.id}`,
    );
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
    expect(addInput).toHaveValue('000');
    userEvent.click(addButton);
    await waitFor(() => {
      expect(addInput).toHaveValue('');
    });
  });

  describe('validation', () => {
    it('should show an error message if there is no number', async () => {
      const { getByLabelText, getByTestId, findByText } = render(
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
      expect(addButton).toBeDisabled();

      expect(await findByText('This field is required')).toBeVisible();
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
      });

      expect(getByText('This field is not a valid phone number')).toBeVisible();
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
      const deleteButton = getByTestId('delete-contactTestId-number2');
      userEvent.click(deleteButton);
      expect(getByRole('heading', { name: 'Confirm' })).toBeInTheDocument();
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

      await waitFor(() => {
        expect(queryByRole('loading')).not.toBeInTheDocument();
        expect(getByRole('button', { name: 'Confirm' })).not.toBeDisabled();
      });

      userEvent.click(getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          expect.stringContaining('Successfully updated phone numbers'),
          expect.objectContaining({ variant: 'success' }),
        );
      });
    });
  });
  describe('submit button', () => {
    it('should submit form without errors', async () => {
      const { getByTestId } = render(<TestComponent />);
      const textField = getByTestId('textfield-contactTestId-number2');
      userEvent.type(textField, '123');
      expect(textField).toHaveValue('78910123');
    });
  });

  it('should show error on each keystroke', async () => {
    const { getByTestId, getAllByTestId } = render(<TestComponent />);
    const textInput = getByTestId('textfield-contactTestId-number2');
    userEvent.clear(textInput);
    userEvent.type(textInput, 'p');

    await waitFor(() => {
      expect(getAllByTestId('statusSelectError')[1]).toHaveTextContent(
        'This field is not a valid phone number',
      );
    });
  });

  it('should not submit form with errors', async () => {
    const { getByTestId, getByRole } = render(<TestComponent />);
    const textInput = getByTestId('textfield-contactTestId-number2');
    userEvent.clear(textInput);
    userEvent.type(textInput, 'p');

    userEvent.click(getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(mockEnqueue).not.toHaveBeenCalledWith(
        expect.stringContaining('Successfully updated phone numbers'),
        expect.objectContaining({ variant: 'success' }),
      );
    });
  });

  it('should submit with matching input', async () => {
    const { getByTestId, getByRole } = render(<TestComponent />);
    const textInput = getByTestId('textfield-contactTestId-number2');
    const inputNumber = '1234';
    userEvent.clear(textInput);
    userEvent.type(textInput, inputNumber);
    expect(textInput).toHaveValue(inputNumber);

    userEvent.click(getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.stringContaining('Successfully updated phone numbers'),
        expect.objectContaining({ variant: 'success' }),
      );
    });
  });
  it('should not submit when number is invalid', async () => {
    const { getByTestId, getByRole } = render(<TestComponent />);
    const textInput = getByTestId('textfield-contactTestId-number2');
    const inputText = 'Aa';
    userEvent.clear(textInput);
    userEvent.type(textInput, inputText);
    expect(textInput).toHaveValue(inputText);

    userEvent.click(getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(mockEnqueue).not.toHaveBeenCalledWith(
        expect.stringContaining('Successfully updated phone numbers'),
        expect.objectContaining({ variant: 'success' }),
      );
    });
  });
});
