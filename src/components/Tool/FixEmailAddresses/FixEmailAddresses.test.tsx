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
  UpdatePeopleMutation,
} from 'src/components/Tool/FixEmailAddresses/FixEmailAddresses.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../theme';
import { EmailAddressesMutation } from './AddEmailAddress.generated';
import {
  FixEmailAddresses,
  PersonEmailAddresses,
  determineBulkDataToSend,
} from './FixEmailAddresses';
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
jest.mock('src/hooks/useGetAppSettings');

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
            UpdatePeople: UpdatePeopleMutation;
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

  it('should show the app name as a source value', async () => {
    (useGetAppSettings as jest.Mock).mockReturnValue({
      appName: 'OtherThing',
    });

    const { getByRole, getByText } = render(<Components />);
    await waitFor(() => {
      expect(getByText('Fix Email Addresses')).toBeInTheDocument();
      expect(getByText('Confirm 2 as OtherThing')).toBeInTheDocument();
      expect(getByRole('combobox')).toHaveDisplayValue('OtherThing');
    });
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

  describe('handleBulkConfirm', () => {
    it('should save all the email changes for all people', async () => {
      const noPeopleMessage = 'No people with email addresses need attention';

      const { getByRole, getByText, getByTestId, queryByTestId } = render(
        <Components />,
      );

      await waitFor(() => {
        expect(queryByTestId('loading')).not.toBeInTheDocument();
        expect(getByTestId('starOutlineIcon-testid-1')).toBeInTheDocument();
      });
      userEvent.click(getByTestId('starOutlineIcon-testid-1'));

      const bulkConfirmButton = getByRole('button', {
        name: 'Confirm 2 as MPDX',
      });
      userEvent.click(bulkConfirmButton);
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Successfully updated email addresses`,
          { variant: 'success' },
        );
        expect(getByText(noPeopleMessage)).toBeVisible();
      });
    });

    it('should handle errors', async () => {
      const personName1 = 'Test Contact';
      const personName2 = 'Simba Lion';

      const { getByRole, getByText, queryByTestId } = render(
        <Components
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockInvalidEmailAddressesResponse,
              },
            },
            UpdatePeople: () => {
              throw new Error('Server error');
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      const bulkConfirmButton = getByRole('button', {
        name: 'Confirm 2 as MPDX',
      });
      userEvent.click(bulkConfirmButton);
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Error updating email addresses`,
          { variant: 'error', autoHideDuration: 7000 },
        );
        expect(getByText(personName1)).toBeVisible();
        expect(getByText(personName2)).toBeVisible();
      });
    });

    it('should cancel the bulk confirmation', async () => {
      const personName1 = 'Test Contact';
      const personName2 = 'Simba Lion';

      const { getByRole, getByText, queryByTestId } = render(
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

      await waitFor(() =>
        expect(queryByTestId('loading')).not.toBeInTheDocument(),
      );

      const bulkConfirmButton = getByRole('button', {
        name: 'Confirm 2 as MPDX',
      });
      userEvent.click(bulkConfirmButton);
      userEvent.click(getByRole('button', { name: 'No' }));

      await waitFor(() => {
        expect(mockEnqueue).not.toHaveBeenCalled();
        expect(getByText(personName1)).toBeVisible();
        expect(getByText(personName2)).toBeVisible();
      });
    });

    it('should not update if there is no email for the default source', async () => {
      const noPrimaryEmailMessage =
        'No DataServer primary email address exists to update';

      const { getByRole, queryByTestId } = render(<Components />);

      await waitFor(() => {
        expect(queryByTestId('loading')).not.toBeInTheDocument();
      });
      userEvent.selectOptions(getByRole('combobox'), 'DataServer');

      const bulkConfirmButton = getByRole('button', {
        name: 'Confirm 2 as DataServer',
      });
      userEvent.click(bulkConfirmButton);
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(noPrimaryEmailMessage, {
          variant: 'warning',
          autoHideDuration: 7000,
        });
        expect(bulkConfirmButton).toBeVisible();
      });
    });
  });

  describe('determineBulkDataToSend', () => {
    it('should set the first email of the given source to primary', () => {
      const dataState = {
        testid: {
          emailAddresses: [
            {
              ...contactOneEmailAddressNodes[0],
              primary: false,
            },
            {
              ...contactOneEmailAddressNodes[1],
            },
            {
              ...contactOneEmailAddressNodes[2],
              primary: true,
            },
          ],
        },
      } as { [key: string]: PersonEmailAddresses };
      const defaultSource = 'MPDX';

      const dataToSend = determineBulkDataToSend(dataState, defaultSource);

      const emails = dataToSend[0].emailAddresses ?? [];
      expect(emails[0].primary).toEqual(true);
      expect(emails[2].primary).toEqual(false);
    });

    it('should be empty if there is no email of the given source', () => {
      const dataState = {
        testid: {
          emailAddresses: [
            {
              ...contactOneEmailAddressNodes[0],
            },
            {
              ...contactOneEmailAddressNodes[1],
            },
            {
              ...contactOneEmailAddressNodes[2],
            },
          ],
        },
      } as { [key: string]: PersonEmailAddresses };
      const defaultSource = 'DataServer';

      const dataToSend = determineBulkDataToSend(dataState, defaultSource);
      expect(dataToSend.length).toEqual(0);
    });
  });
});
