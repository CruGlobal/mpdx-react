import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  GetInvalidEmailAddressesQuery,
  UpdateEmailAddressesMutation,
} from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses.generated';
import theme from '../../../theme';
import { EmailAddressesMutation } from './AddEmailAddress.generated';
import { FixEmailAddresses } from './FixEmailAddresses';
import {
  contactId,
  contactOneEmailAddressNodes,
  mockInvalidEmailAddressesResponse,
  newEmail,
} from './FixEmailAddressesMocks';

const accountListId = 'accountListId';
const router = {
  query: { accountListId },
  isReady: true,
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

const defaultGraphQLMock = {
  GetInvalidEmailAddresses: {
    people: { nodes: mockInvalidEmailAddressesResponse },
  },
};

interface ComponentsProps {
  mocks?: ApolloErgonoMockMap;
}

const Components = ({ mocks = defaultGraphQLMock }: ComponentsProps) => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <TestWrapper>
          <GqlMockedProvider<{
            GetInvalidEmailAddresses: GetInvalidEmailAddressesQuery;
            EmailAddresses: EmailAddressesMutation;
            UpdateEmailAddresses: UpdateEmailAddressesMutation;
          }>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <FixEmailAddresses
              accountListId={accountListId}
              setContactFocus={setContactFocus}
            />
          </GqlMockedProvider>
        </TestWrapper>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('FixEmailAddresses-Home', () => {
  it('default with test data', async () => {
    const { getByText, getByTestId, queryByTestId } = render(<Components />);

    await waitFor(() =>
      expect(getByText('Fix Email Addresses')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(getByTestId('starOutlineIcon-testid-1')).toBeInTheDocument(),
    );
    await expect(
      getByText('You have 2 email addresses to confirm.'),
    ).toBeInTheDocument();
    expect(getByText('Confirm 2 as MPDX')).toBeInTheDocument();
    expect(getByText('Test Contact')).toBeInTheDocument();
    expect(getByText('Simba Lion')).toBeInTheDocument();
    expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    expect(getByTestId('starIcon-testid-0')).toBeInTheDocument();
    expect(queryByTestId('no-data')).not.toBeInTheDocument();
  });

  describe('handleChangePrimary()', () => {
    it('changes primary of first email', async () => {
      const { getByTestId, queryByTestId } = render(<Components />);

      const star1 = await waitFor(() =>
        getByTestId('starOutlineIcon-testid-1'),
      );
      userEvent.click(star1);

      expect(queryByTestId('starIcon-testid-0')).not.toBeInTheDocument();
      expect(getByTestId('starIcon-testid-1')).toBeInTheDocument();
      expect(getByTestId('starOutlineIcon-testid-0')).toBeInTheDocument();
    });

    it('should choose primary and deselect primary from others', async () => {
      const { getByTestId, queryByTestId } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: [
                  {
                    ...mockInvalidEmailAddressesResponse[0],
                    emailAddresses: {
                      nodes: [
                        {
                          ...contactOneEmailAddressNodes[0],
                          primary: true,
                        },
                        {
                          ...contactOneEmailAddressNodes[1],
                          primary: true,
                        },
                        {
                          ...contactOneEmailAddressNodes[2],
                          primary: true,
                        },
                      ],
                    },
                  },
                  {
                    ...mockInvalidEmailAddressesResponse[1],
                  },
                ],
              },
            },
          }}
        />,
      );

      let newPrimary;
      await waitFor(() => {
        expect(getByTestId('starIcon-testid-0')).toBeInTheDocument();
        expect(getByTestId('starIcon-testid-1')).toBeInTheDocument();
        newPrimary = getByTestId('starIcon-testid-2');
        expect(newPrimary).toBeInTheDocument();
      });
      userEvent.click(newPrimary);

      await waitFor(() => {
        expect(queryByTestId('starIcon-testid-0')).not.toBeInTheDocument();
        expect(queryByTestId('starIcon-testid-1')).not.toBeInTheDocument();
        expect(getByTestId('starIcon-testid-2')).toBeInTheDocument();
        expect(getByTestId('starOutlineIcon-testid-0')).toBeInTheDocument();
        expect(getByTestId('starOutlineIcon-testid-1')).toBeInTheDocument();
        expect(
          queryByTestId('starOutlineIcon-testid-2'),
        ).not.toBeInTheDocument();
      });
    });
  });

  it('should add an new email address, firing a GraphQL mutation and resetting the form', async () => {
    const { getByTestId, getAllByLabelText } = render(<Components />);
    await waitFor(() => {
      expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    });
    const textFieldNew = getAllByLabelText('New Email Address')[0];
    userEvent.type(textFieldNew, newEmail.email);
    const addButton = getByTestId('addButton-testid');
    expect(textFieldNew).toHaveValue(newEmail.email);

    userEvent.click(addButton);

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Added email address', {
        variant: 'success',
      }),
    );

    expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
      'EmailAddresses',
    );
    expect(mutationSpy.mock.calls[1][0].operation.variables).toEqual({
      input: {
        accountListId: accountListId,
        attributes: {
          id: 'testid',
          emailAddresses: [{ email: newEmail.email }],
        },
      },
    });
    expect(textFieldNew).toHaveValue('');
  });

  it('delete third email from first person', async () => {
    const { getByTestId, getByText, getByRole, queryByTestId } = render(
      <Components />,
    );

    const delete02 = await waitFor(() => getByTestId('delete-testid-2'));
    userEvent.click(delete02);

    await waitFor(() =>
      getByText(`Are you sure you wish to delete this email address:`),
    );
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(queryByTestId('textfield-testid-2')).not.toBeInTheDocument();
    });
  });

  it('change second email for second person to primary then delete it', async () => {
    const { getByTestId, queryByTestId, getByText, getByRole } = render(
      <Components />,
    );

    const star11 = await waitFor(() =>
      getByTestId('starOutlineIcon-testid2-1'),
    );
    userEvent.click(star11);

    const delete11 = await waitFor(() => getByTestId('delete-testid2-1'));
    userEvent.click(delete11);

    await waitFor(() =>
      getByText(`Are you sure you wish to delete this email address:`),
    );
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(queryByTestId('starIcon-testid2-1')).not.toBeInTheDocument();
      expect(getByTestId('starIcon-testid2-0')).toBeInTheDocument();
    });
  });

  it('should render no contacts with no data', async () => {
    const { getByText, getByTestId } = render(
      <Components
        mocks={{
          GetInvalidEmailAddresses: {
            people: { nodes: [] },
          },
        }}
      />,
    );
    await waitFor(() =>
      expect(getByTestId('fixEmailAddresses-null-state')).toBeInTheDocument(),
    );
    expect(
      getByText('No people with email addresses need attention'),
    ).toBeInTheDocument();
  });

  it('should modify first email of first contact', async () => {
    const { getByTestId } = render(<Components />);
    await waitFor(() => {
      expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    });
    const firstInput = getByTestId('textfield-testid-0');

    expect(firstInput).toHaveValue('email1@gmail.com');
    userEvent.type(firstInput, '123');
    expect(firstInput).toHaveValue('email1@gmail.com123');
  });

  describe('setContactFocus()', () => {
    it('should open up contact details', async () => {
      const { getByText, queryByTestId } = render(<Components />);
      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );
      expect(setContactFocus).not.toHaveBeenCalled();

      const contactName = getByText('Test Contact');

      expect(contactName).toBeInTheDocument();
      userEvent.click(contactName);
      expect(setContactFocus).toHaveBeenCalledWith(contactId);
    });
  });

  describe('Add email address - Testing cache', () => {
    it('should add an email address to the first person', async () => {
      const { getAllByTestId, getByTestId, queryByTestId, getAllByRole } =
        render(<Components />);

      const emailInput = await waitFor(
        () => getAllByRole('textbox', { name: 'New Email Address' })[0],
      );
      const addButton = getAllByTestId('addButton-testid')[0];
      expect(queryByTestId('starOutlineIcon-testid-2')).not.toBeInTheDocument();

      expect(addButton).toBeDisabled();
      userEvent.type(emailInput, 'test@cru.org');
      expect(addButton).not.toBeDisabled();
      userEvent.click(addButton);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith('Added email address', {
          variant: 'success',
        });
      });

      await waitFor(() =>
        expect(getByTestId('starOutlineIcon-testid-2')).toBeInTheDocument(),
      );
    });
  });

  describe('handleSingleConfirm', () => {
    it('should successfully submit changes to multiple emails', async () => {
      const personName = 'Test Contact';
      const { getAllByRole, getByTestId, getByText, queryByText } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(getByTestId('starOutlineIcon-testid-1')).toBeInTheDocument();
      });

      expect(getByText(personName)).toBeInTheDocument();

      const confirmButton = getAllByRole('button', { name: 'Confirm' })[0];
      userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Successfully updated email addresses for ${personName}`,
          { variant: 'success' },
        );
        expect(queryByText(personName)).not.toBeInTheDocument();
      });
    }, 999999);

    it('should handle an error', async () => {
      const { getAllByRole, getByTestId } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
            UpdateEmailAddresses: () => {
              throw new Error('Server Error');
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(getByTestId('starOutlineIcon-testid-1')).toBeInTheDocument(),
      );

      const confirmButton = getAllByRole('button', { name: 'Confirm' })[0];
      userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Error updating email addresses for Test Contact',
          { variant: 'error', autoHideDuration: 7000 },
        );
      });
    });
  });
});
